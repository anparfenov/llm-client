import type { TranslationKey } from "@lib/i18n";
import type { Message } from "@chat/types";

type Translate = (key: TranslationKey) => string;

export const createInitialMessages = (t: Translate): Message[] => [
	{
		id: "initial-assistant",
		role: "assistant",
		content: t("initialAssistantMessage"),
	},
];
