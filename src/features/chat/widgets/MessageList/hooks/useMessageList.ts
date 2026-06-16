import type { Message } from "@chat/types";

import { useI18n } from "@lib/i18n";
import { createEffect, on } from "solid-js";

export type MessageListProps = {
	messages: Message[];
};

export function useMessageList(props: MessageListProps) {
	const { t } = useI18n();
	let listElement: HTMLElement | undefined;

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			listElement?.scrollTo({
				top: listElement.scrollHeight,
				behavior: "auto",
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
			listElement = element;
		},
		conversationLabel: () => t("conversationLabel"),
	};
}
