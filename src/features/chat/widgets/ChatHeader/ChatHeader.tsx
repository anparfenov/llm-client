import styles from "@chat/widgets/ChatHeader/ChatHeader.module.css";
import { useChatHeader } from "@chat/widgets/ChatHeader/hooks/useChatHeader";
import type { ChatHeaderProps } from "@chat/widgets/ChatHeader/types";

export function ChatHeader(props: ChatHeaderProps) {
	const header = useChatHeader();

	return (
		<header class={styles.chatHeader}>
			<div>
				<p class={styles.eyebrow}>{header.labels.brand()}</p>
				<h1 class={styles.title}>{header.labels.title()}</h1>
			</div>
			<button
				class={styles.newChatButton}
				type="button"
				onClick={props.onNewChat}
			>
				{header.labels.newChat()}
			</button>
		</header>
	);
}
