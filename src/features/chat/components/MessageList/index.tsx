import { createEffect, For, on } from 'solid-js';

import { useI18n } from '../../../../lib/i18n';
import { MessageItem } from '../MessageItem';
import type { Message } from '../../types';
import styles from './MessageList.module.css';

type MessageListProps = {
  messages: Message[];
};

export function MessageList(props: MessageListProps) {
  const { t } = useI18n();
  let listElement: HTMLElement | undefined;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listElement?.scrollTo({
        top: listElement.scrollHeight,
        behavior: 'smooth',
      });
    });
  };

  createEffect(
    on(
      () => {
        const lastMessage = props.messages.at(-1);

        return [
          props.messages.length,
          lastMessage?.content,
          lastMessage?.thinking,
          lastMessage?.status,
        ].join('|');
      },
      scrollToBottom,
    ),
  );

  return (
    <section ref={listElement} class={styles.messageList} aria-label={t('conversationLabel')}>
      <For each={props.messages}>{(message) => <MessageItem message={message} />}</For>
    </section>
  );
}
