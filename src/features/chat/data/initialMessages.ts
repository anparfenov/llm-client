import type { Message } from "@chat/types";
import type { TranslationKey } from "@lib/i18n";

type Translate = (key: TranslationKey) => string;

export const createInitialMessages = (t: Translate): Message[] => [
	{
		id: "initial-assistant",
		role: "assistant",
		content: t("initialAssistantMessage"),
	},
];
