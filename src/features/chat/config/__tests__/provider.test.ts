import { resolveChatProviderConfig } from "@chat/config/provider";

describe("resolveChatProviderConfig", () => {
	it("defaults to OpenAI when the provider is unset", () => {
		expect(
			resolveChatProviderConfig({
				VITE_OPENAI_DEFAULT_MODEL: "compatible-model",
			}),
		).toEqual({
			id: "openai",
			model: { id: "compatible-model", label: "compatible-model" },
			supportsThinking: true,
		});
	});

	it("requires an OpenAI-compatible model", () => {
		expect(() => resolveChatProviderConfig({})).toThrow(
			"VITE_OPENAI_DEFAULT_MODEL is required",
		);
	});

	it("keeps Ollama available with thinking support", () => {
		expect(resolveChatProviderConfig({ VITE_CHAT_PROVIDER: "ollama" })).toEqual(
			{
				id: "ollama",
				model: { id: "qwen3.5:4b", label: "qwen3.5:4b" },
				supportsThinking: true,
			},
		);
	});

	it("rejects unsupported providers", () => {
		expect(() =>
			resolveChatProviderConfig({ VITE_CHAT_PROVIDER: "unsupported" }),
		).toThrow("Unsupported VITE_CHAT_PROVIDER");
	});
});
