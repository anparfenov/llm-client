import { MarkdownContent } from "@chat/widgets/MarkdownContent/MarkdownContent";
import { useMessageItem } from "@chat/widgets/MessageItem/hooks/useMessageItem";
import styles from "@chat/widgets/MessageItem/MessageItem.module.css";
import type { MessageItemProps } from "@chat/widgets/MessageItem/types";

export function MessageItem(props: MessageItemProps) {
	const messageItem = useMessageItem(props, styles);

	return (
		<article
			class={`${styles.messageRow} ${messageItem.roleClass()} ${messageItem.statusClass()}`}
		>
			<div class={styles.messageBubble}>
				{messageItem.hasThinking() && (
					<div class={styles.thinkingTrace}>
						<div class={styles.thinkingLabel}>
							{messageItem.thinkingLabel()}
						</div>
						<p>{props.message.thinking}</p>
					</div>
				)}
				{messageItem.content() && (
					<MarkdownContent
						content={messageItem.content()}
						isStreaming={messageItem.isStreaming()}
					/>
				)}
			</div>
		</article>
	);
}
