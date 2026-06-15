import { MarkdownContent } from '@chat/components/MarkdownContent';
import { useMessageDisplay } from '@chat/hooks/useMessageDisplay';
import type { Message } from '@chat/types';
import styles from '@chat/components/MessageItem/MessageItem.module.css';

type MessageItemProps = {
  message: Message;
};

export function MessageItem(props: MessageItemProps) {
  const display = useMessageDisplay(props);
  const roleClass = () => (props.message.role === 'user' ? styles.user : '');
  const statusClass = () =>
    props.message.status === 'pending' || props.message.status === 'error'
      ? styles[props.message.status]
      : '';

  return (
    <article class={`${styles.messageRow} ${roleClass()} ${statusClass()}`}>
      <div class={styles.avatar} aria-hidden="true">
        {display.avatarLabel()}
      </div>
      <div class={styles.messageBubble}>
        {display.hasThinking() && (
          <div class={styles.thinkingTrace}>
            <div class={styles.thinkingLabel}>{display.thinkingLabel()}</div>
            <p>{props.message.thinking}</p>
          </div>
        )}
        {display.content() && <MarkdownContent content={display.content()} />}
      </div>
    </article>
  );
}
