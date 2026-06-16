import { useI18n } from "@lib/i18n";
import type { Message } from "@chat/types";

type UseMessageDisplayProps = {
	message: Message;
};

export function useMessageDisplay(props: UseMessageDisplayProps) {
	const { t } = useI18n();

	const avatarLabel = () =>
		props.message.role === "assistant" ? t("assistantAvatar") : t("userAvatar");
	const hasThinking = () => Boolean(props.message.thinking?.trim());
	const content = () =>
		props.message.status === "pending" &&
		!props.message.content &&
		!hasThinking()
			? t("pendingAssistantMessage")
			: props.message.content;

	return {
		avatarLabel,
		hasThinking,
		content,
		thinkingLabel: () => t("thinkingLabel"),
	};
}
