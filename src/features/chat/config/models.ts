import { resolveChatProviderConfig } from "@chat/config/provider";

export const chatProvider = resolveChatProviderConfig({
	VITE_CHAT_PROVIDER: import.meta.env.VITE_CHAT_PROVIDER,
	VITE_OLLAMA_DEFAULT_MODEL: import.meta.env.VITE_OLLAMA_DEFAULT_MODEL,
	VITE_OPENAI_DEFAULT_MODEL: import.meta.env.VITE_OPENAI_DEFAULT_MODEL,
});

export const chatModels = [chatProvider.model];
export const defaultChatModel = chatProvider.model;

export const chatApiUrl = import.meta.env.VITE_CHAT_API_URL || "";
