import { submitOllamaChatMessage } from "@chat/api/ollamaChat";
import { submitOpenAIChatMessage } from "@chat/api/openAIChat";
import type { SubmitChatRequest, SubmitChatResponse } from "@chat/api/types";
import type { ChatProvider } from "@chat/config/types";

export function submitChatMessage(
	provider: ChatProvider,
	request: SubmitChatRequest,
): Promise<SubmitChatResponse> {
	return provider === "openai"
		? submitOpenAIChatMessage(request)
		: submitOllamaChatMessage(request);
}
