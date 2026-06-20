import type { Message } from "@chat/types";
import type { Translate } from "@chat/data/types";

export const createInitialMessages = (t: Translate): Message[] => [
	{
		id: "initial-assistant",
		role: "assistant",
		content: t("initialAssistantMessage"),
	},
];
