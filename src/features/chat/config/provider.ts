import type {
	ChatProviderConfig,
	ChatProviderEnvironment,
} from "@chat/config/types";

export function resolveChatProviderConfig(
	environment: ChatProviderEnvironment,
): ChatProviderConfig {
	const provider = environment.VITE_CHAT_PROVIDER || "openai";

	if (provider === "openai") {
		const model = environment.VITE_OPENAI_DEFAULT_MODEL;

		if (!model) {
			throw new Error(
				"VITE_OPENAI_DEFAULT_MODEL is required when VITE_CHAT_PROVIDER is openai.",
			);
		}

		return {
			id: provider,
			model: { id: model, label: model },
			supportsThinking: true,
		};
	}

	if (provider === "ollama") {
		const model = environment.VITE_OLLAMA_DEFAULT_MODEL || "qwen3.5:4b";

		return {
			id: provider,
			model: { id: model, label: model },
			supportsThinking: true,
		};
	}

	throw new Error(
		`Unsupported VITE_CHAT_PROVIDER "${provider}". Expected openai or ollama.`,
	);
}
