import type { MessageListProps } from "@chat/widgets/MessageList/types";

import { useI18n } from "@lib/i18n";
import { createEffect, on } from "solid-js";

export function useMessageList(props: MessageListProps) {
	const { t } = useI18n();
	let scrollElement: HTMLElement | undefined;

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				scrollElement?.scrollTo({
					top: scrollElement.scrollHeight,
					behavior: "auto",
				});
			});
		});
	};

	createEffect(
		on(() => {
			const lastMessage = props.messages.at(-1);

			return [
				props.messages.length,
				lastMessage?.content,
				lastMessage?.thinking,
				lastMessage?.status,
			].join("|");
		}, scrollToBottom),
	);

	return {
		setListElement: (element: HTMLElement) => {
			scrollElement = element.parentElement ?? element;
			scrollToBottom();
		},
		conversationLabel: () => t("conversationLabel"),
	};
}
