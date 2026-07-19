export type ChatModel = {
	id: string;
	label: string;
};

export type ChatProvider = "ollama" | "openai";

export type ChatProviderConfig = {
	id: ChatProvider;
	model: ChatModel;
	supportsThinking: boolean;
};

export type ChatProviderEnvironment = {
	VITE_CHAT_PROVIDER?: string;
	VITE_OLLAMA_DEFAULT_MODEL?: string;
	VITE_OPENAI_DEFAULT_MODEL?: string;
};
