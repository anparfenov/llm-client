import { MessageItem } from "@chat/widgets/MessageItem/MessageItem";
import {
	type MessageListProps,
	useMessageList,
} from "@chat/widgets/MessageList/hooks/useMessageList";
import styles from "@chat/widgets/MessageList/MessageList.module.css";
import { For } from "solid-js";

export function MessageList(props: MessageListProps) {
	const messageList = useMessageList(props);

	return (
		<section
			ref={messageList.setListElement}
			class={styles.messageList}
			aria-label={messageList.conversationLabel()}
		>
			<For each={props.messages}>
				{(message) => <MessageItem message={message} />}
			</For>
		</section>
	);
}
