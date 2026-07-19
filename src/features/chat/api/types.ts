import type { Message } from "@chat/types";

export type OllamaRole = "user" | "assistant" | "system";

export type OllamaChatMessage = {
	role: OllamaRole;
	content: string;
	thinking?: string;
};

export type OllamaChatRequest = {
	model: string;
	messages: OllamaChatMessage[];
	stream: boolean;
	think: boolean;
};

export type OllamaChatResponse = {
	done?: boolean;
	message?: OllamaChatMessage;
	error?: string;
};

export type OpenAIChatMessage = {
	role: "user" | "assistant" | "system";
	content: string;
};

export type OpenAIChatRequest = {
	model: string;
	messages: OpenAIChatMessage[];
	stream: boolean;
};

export type OpenAIChatResponse = {
	choices?: Array<{
		message?: { content?: string | null };
	}>;
	error?: { message?: string };
};

export type OpenAIChatStreamChunk = {
	choices?: Array<{
		delta?: { content?: string | null };
	}>;
	error?: { message?: string };
};

export type SubmitChatRequest = {
	apiUrl: string;
	model: string;
	messages: Message[];
	stream?: boolean;
	fallbackContent: string;
	connectionErrorContent: string;
	requestErrorContent: string;
	think: boolean;
	onContentDelta?: (delta: string) => void;
	onThinkingDelta?: (delta: string) => void;
};

export type SubmitChatResponse = {
	content: string;
	thinking?: string;
	isError?: boolean;
};
