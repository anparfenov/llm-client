import {
	parseOpenAIStreamLine,
	submitOpenAIChatMessage,
} from "@chat/api/openAIChat";
import type { SubmitChatRequest } from "@chat/api/types";

const request: SubmitChatRequest = {
	apiUrl: "",
	model: "compatible-model",
	messages: [{ id: "user-1", role: "user", content: "Hello" }],
	stream: false,
	fallbackContent: "empty",
	connectionErrorContent: "connection error",
	requestErrorContent: "request error",
	think: false,
};

describe("submitOpenAIChatMessage", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("reads a non-streamed chat completion", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [
						{
							message: {
								content: "Hello back",
								reasoning_content: "Considered it",
							},
						},
					],
				}),
				{ status: 200 },
			),
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(submitOpenAIChatMessage(request)).resolves.toEqual({
			content: "Hello back",
			thinking: "Considered it",
		});
		expect(fetchMock).toHaveBeenCalledWith(
			"/chat/completions",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Accept: "application/json",
				}),
				body: JSON.stringify({
					model: "compatible-model",
					messages: [{ role: "user", content: "Hello" }],
					stream: false,
					chat_template_kwargs: { enable_thinking: false },
				}),
			}),
		);
	});

	it("reads fragmented server-sent stream events", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode('data: {"choices":[{"delta":{"content":"Hel'),
				);
				controller.enqueue(
					encoder.encode(
						'lo","reasoning_content":"Think"}}]}\n\ndata: {"choices":[{"delta":{"content":"!"}}]}\n\ndata: [DONE]\n\n',
					),
				);
				controller.close();
			},
		});
		const onContentDelta = vi.fn();
		const onThinkingDelta = vi.fn();
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response(stream, { status: 200 }));

		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		vi.stubGlobal("fetch", fetchMock);

		await expect(
			submitOpenAIChatMessage({
				...request,
				stream: true,
				think: true,
				onContentDelta,
				onThinkingDelta,
			}),
		).resolves.toEqual({
			content: "Hello!",
			thinking: "Think",
			isError: false,
		});
		expect(onContentDelta).toHaveBeenNthCalledWith(1, "Hello");
		expect(onContentDelta).toHaveBeenNthCalledWith(2, "!");
		expect(onThinkingDelta).toHaveBeenCalledWith("Think");
		expect(fetchMock).toHaveBeenCalledWith(
			"/chat/completions",
			expect.objectContaining({
				headers: expect.objectContaining({ Accept: "text/event-stream" }),
				body: expect.stringContaining(
					'"chat_template_kwargs":{"enable_thinking":true}',
				),
			}),
		);
	});

	it("publishes SSE content before the response stream closes", async () => {
		const encoder = new TextEncoder();
		let streamClosed = false;
		let resolveFirstDelta: (() => void) | undefined;
		const firstDelta = new Promise<void>((resolve) => {
			resolveFirstDelta = resolve;
		});
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						'data: {"choices":[{"delta":{"content":"First"}}]}\n\n',
					),
				);

				setTimeout(() => {
					controller.enqueue(
						encoder.encode(
							'data: {"choices":[{"delta":{"content":" second"}}]}\n\ndata: [DONE]\n\n',
						),
					);
					controller.close();
					streamClosed = true;
				}, 20);
			},
		});
		const onContentDelta = vi.fn(() => resolveFirstDelta?.());

		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
			setTimeout(() => callback(0), 0),
		);
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(stream, {
					status: 200,
					headers: { "Content-Type": "text/event-stream" },
				}),
			),
		);

		const response = submitOpenAIChatMessage({
			...request,
			stream: true,
			onContentDelta,
		});

		await firstDelta;
		expect(streamClosed).toBe(false);
		await expect(response).resolves.toEqual({
			content: "First second",
			isError: false,
		});
	});

	it("uses fallback content for an empty completion", async () => {
		vi.spyOn(console, "warn").mockImplementation(() => undefined);
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ choices: [] }), { status: 200 }),
				),
		);

		await expect(submitOpenAIChatMessage(request)).resolves.toEqual({
			content: "empty",
		});
	});

	it("maps upstream request errors", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ error: { message: "invalid model" } }), {
					status: 400,
				}),
			),
		);

		await expect(submitOpenAIChatMessage(request)).resolves.toEqual({
			content: "request error",
			isError: true,
		});
	});

	it("maps connection failures", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

		await expect(submitOpenAIChatMessage(request)).resolves.toEqual({
			content: "connection error",
			isError: true,
		});
	});
});

describe("parseOpenAIStreamLine", () => {
	it("recognizes the stream terminator", () => {
		expect(parseOpenAIStreamLine("data: [DONE]")).toBe("done");
	});

	it("ignores malformed and non-data events", () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);

		expect(parseOpenAIStreamLine("event: message")).toBeNull();
		expect(parseOpenAIStreamLine("data: invalid")).toBeNull();
	});
});
