import type { Message } from "@chat/types";
import { useI18n } from "@lib/i18n";

export type MessageItemProps = {
	message: Message;
};

type MessageItemStyles = Record<string, string>;

export function useMessageItem(
	props: MessageItemProps,
	styles: MessageItemStyles,
) {
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
	const roleClass = () => (props.message.role === "user" ? styles.user : "");
	const statusClass = () =>
		props.message.status === "pending" || props.message.status === "error"
			? styles[props.message.status]
			: "";

	return {
		avatarLabel,
		hasThinking,
		content,
		roleClass,
		statusClass,
		thinkingLabel: () => t("thinkingLabel"),
	};
}
