import type {
	MessageItemProps,
	MessageItemStyles,
} from "@chat/widgets/MessageItem/types";
import { useI18n } from "@lib/i18n";

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
	const isStreaming = () => props.message.status === "pending";
	const roleClass = () => (props.message.role === "user" ? styles.user : "");
	const statusClass = () =>
		props.message.status === "pending" || props.message.status === "error"
			? styles[props.message.status]
			: "";

	return {
		avatarLabel,
		hasThinking,
		content,
		isStreaming,
		roleClass,
		statusClass,
		thinkingLabel: () => t("thinkingLabel"),
	};
}
