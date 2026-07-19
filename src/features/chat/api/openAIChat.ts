import {
	createStreamDeltaBuffer,
	nextAnimationFrame,
} from "@chat/api/streaming";
import type {
	OpenAIChatMessage,
	OpenAIChatRequest,
	OpenAIChatResponse,
	OpenAIChatStreamChunk,
	SubmitChatRequest,
	SubmitChatResponse,
} from "@chat/api/types";

const streamDeltaBufferMs = 200;

export async function submitOpenAIChatMessage(
	request: SubmitChatRequest,
): Promise<SubmitChatResponse> {
	let response: Response;
	const stream = request.stream ?? false;

	try {
		response = await fetch(`${request.apiUrl}/api/openai/chat`, {
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
					.map(toOpenAIMessage),
				stream,
			} satisfies OpenAIChatRequest),
		});
	} catch (error) {
		console.error("Unable to reach the OpenAI-compatible API.", error);

		return {
			content: request.connectionErrorContent,
			isError: true,
		};
	}

	if (stream) {
		return readOpenAIStreamResponse(response, request);
	}

	const data = await readOpenAIResponse(response);

	if (!response.ok) {
		console.error(
			"OpenAI-compatible chat request failed.",
			data?.error?.message || response.statusText,
		);

		return {
			content: request.requestErrorContent,
			isError: true,
		};
	}

	const content = data?.choices?.[0]?.message?.content;

	if (!content) {
		console.warn("The OpenAI-compatible API returned an empty response.");
	}

	return {
		content: content || request.fallbackContent,
	};
}

async function readOpenAIStreamResponse(
	response: Response,
	request: SubmitChatRequest,
): Promise<SubmitChatResponse> {
	if (!response.ok) {
		const data = await readOpenAIResponse(response);

		console.error(
			"OpenAI-compatible chat request failed.",
			data?.error?.message || response.statusText,
		);

		return {
			content: request.requestErrorContent,
			isError: true,
		};
	}

	if (!response.body) {
		console.warn("The OpenAI-compatible API returned an empty HTTP response.");

		return { content: request.fallbackContent };
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	const deltaBuffer = createStreamDeltaBuffer(request, streamDeltaBufferMs);
	let buffer = "";
	let content = "";
	let streamErrorContent = "";

	const readLine = (line: string) => {
		const event = parseOpenAIStreamLine(line);

		if (!event || event === "done") {
			return;
		}

		const delta = event.choices?.[0]?.delta?.content ?? "";

		if (delta) {
			content += delta;
			deltaBuffer.addContent(delta);
		}

		if (event.error) {
			console.error(
				"OpenAI-compatible stream returned an error.",
				event.error.message,
			);
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
		console.error("Unable to read the OpenAI-compatible stream.", error);
		deltaBuffer.flush();

		return {
			content: content || request.connectionErrorContent,
			isError: true,
		};
	}

	buffer += decoder.decode();

	if (buffer.trim()) {
		readLine(buffer);
	}

	deltaBuffer.flush();

	if (!content) {
		console.warn("The OpenAI-compatible API returned an empty stream.");
	}

	return {
		content: content || streamErrorContent || request.fallbackContent,
		isError: Boolean(streamErrorContent && !content),
	};
}

async function readOpenAIResponse(
	response: Response,
): Promise<OpenAIChatResponse | null> {
	const text = await response.text();

	if (!text.trim()) {
		return null;
	}

	try {
		return JSON.parse(text) as OpenAIChatResponse;
	} catch (error) {
		console.error("The OpenAI-compatible API returned invalid JSON.", error);

		return null;
	}
}

export function parseOpenAIStreamLine(
	line: string,
): OpenAIChatStreamChunk | "done" | null {
	const trimmedLine = line.trim();

	if (!trimmedLine.startsWith("data:")) {
		return null;
	}

	const data = trimmedLine.slice(5).trim();

	if (!data) {
		return null;
	}

	if (data === "[DONE]") {
		return "done";
	}

	try {
		return JSON.parse(data) as OpenAIChatStreamChunk;
	} catch (error) {
		console.error(
			"The OpenAI-compatible API returned an invalid event.",
			error,
		);

		return null;
	}
}

function toOpenAIMessage(
	message: SubmitChatRequest["messages"][number],
): OpenAIChatMessage {
	return {
		role: message.role,
		content: message.content,
	};
}
