import type {
	OllamaChatMessage,
	OllamaChatRequest,
	OllamaChatResponse,
	SubmitChatRequest,
	SubmitChatResponse,
} from "@chat/api/types";

const streamDeltaBufferMs = 200;

export async function submitOllamaChatMessage(
	request: SubmitChatRequest,
): Promise<SubmitChatResponse> {
	let response: Response;
	const stream = request.stream ?? false;

	try {
		response = await fetch(`${request.apiUrl}/api/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Protection": "1",
			},
			body: JSON.stringify({
				model: request.model,
				messages: request.messages
					.filter(
						(message) =>
							message.status !== "pending" && message.status !== "error",
					)
					.map(toOllamaMessage),
				stream,
				think: request.think,
			} satisfies OllamaChatRequest),
		});
	} catch (error) {
		console.error("Unable to reach Ollama.", error);

		return {
			content: request.connectionErrorContent,
			isError: true,
		};
	}

	if (stream) {
		return readOllamaStreamResponse(response, request);
	}

	const data = await readOllamaResponse(response);

	if (!response.ok) {
		console.error(
			"Ollama chat request failed.",
			data?.error || response.statusText,
		);

		return {
			content: request.requestErrorContent,
			isError: true,
		};
	}

	if (!data) {
		return {
			content: request.fallbackContent,
		};
	}

	if (data.done !== true) {
		console.warn("Ollama response did not complete.", data);
	}

	if (!data.message?.content) {
		console.warn("Ollama returned an empty response.", data);
	}

	return {
		content: data.message?.content || request.fallbackContent,
	};
}

async function readOllamaStreamResponse(
	response: Response,
	request: SubmitChatRequest,
): Promise<SubmitChatResponse> {
	if (!response.ok) {
		const data = await readOllamaResponse(response);

		console.error(
			"Ollama chat request failed.",
			data?.error || response.statusText,
		);

		return {
			content: request.requestErrorContent,
			isError: true,
		};
	}

	if (!response.body) {
		console.warn("Ollama returned an empty HTTP response.", response.status);

		return {
			content: request.fallbackContent,
		};
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let content = "";
	let thinking = "";
	let streamErrorContent = "";
	const deltaBuffer = createStreamDeltaBuffer(request, streamDeltaBufferMs);

	const readLine = (line: string) => {
		const data = parseOllamaJsonLine(line);

		if (!data) {
			return;
		}

		const delta = data.message?.content ?? "";
		const thinkingDelta = data.message?.thinking ?? "";

		if (delta) {
			content += delta;
			deltaBuffer.addContent(delta);
		}

		if (thinkingDelta) {
			thinking += thinkingDelta;
			deltaBuffer.addThinking(thinkingDelta);
		}

		if (data.error) {
			console.error("Ollama stream returned an error.", data.error);
			streamErrorContent = request.requestErrorContent;
		}
	};

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				break;
			}

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";

			for (const line of lines) {
				readLine(line);
			}

			await nextAnimationFrame();
		}
	} catch (error) {
		console.error("Unable to read Ollama stream.", error);
		deltaBuffer.flush();

		return {
			content: content || request.connectionErrorContent,
			thinking,
			isError: true,
		};
	}

	buffer += decoder.decode();

	if (buffer.trim()) {
		readLine(buffer);
	}

	deltaBuffer.flush();

	if (!content) {
		console.warn("Ollama returned an empty streamed response.");
	}

	return {
		content:
			content ||
			streamErrorContent ||
			(thinking ? "" : request.fallbackContent),
		thinking,
		isError: Boolean(streamErrorContent && !content),
	};
}

function nextAnimationFrame(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => resolve());
	});
}

function createStreamDeltaBuffer(
	request: SubmitChatRequest,
	delayMs: number,
): {
	addContent: (delta: string) => void;
	addThinking: (delta: string) => void;
	flush: () => void;
} {
	let contentDelta = "";
	let thinkingDelta = "";
	let flushTimeout: ReturnType<typeof setTimeout> | undefined;

	const flush = () => {
		if (flushTimeout) {
			clearTimeout(flushTimeout);
			flushTimeout = undefined;
		}

		if (contentDelta) {
			request.onContentDelta?.(contentDelta);
			contentDelta = "";
		}

		if (thinkingDelta) {
			request.onThinkingDelta?.(thinkingDelta);
			thinkingDelta = "";
		}
	};

	const scheduleFlush = () => {
		flushTimeout ??= setTimeout(flush, delayMs);
	};

	return {
		addContent: (delta: string) => {
			contentDelta += delta;
			scheduleFlush();
		},
		addThinking: (delta: string) => {
			thinkingDelta += delta;
			scheduleFlush();
		},
		flush,
	};
}

async function readOllamaResponse(
	response: Response,
): Promise<OllamaChatResponse | null> {
	const text = await response.text();

	if (!text.trim()) {
		console.warn("Ollama returned an empty HTTP response.", response.status);

		return null;
	}

	try {
		return JSON.parse(text) as OllamaChatResponse;
	} catch (error) {
		console.error("Ollama returned invalid JSON.", error);

		return null;
	}
}

function parseOllamaJsonLine(line: string): OllamaChatResponse | null {
	const trimmedLine = line.trim();

	if (!trimmedLine) {
		return null;
	}

	try {
		return JSON.parse(trimmedLine) as OllamaChatResponse;
	} catch (error) {
		console.error("Ollama returned an invalid stream chunk.", error);

		return null;
	}
}

function toOllamaMessage(
	message: SubmitChatRequest["messages"][number],
): OllamaChatMessage {
	return {
		role: message.role,
		content: message.content,
	};
}
