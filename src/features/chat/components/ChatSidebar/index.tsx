import { createSignal, For, Show } from 'solid-js';

import { useI18n } from '@lib/i18n';
import type { SavedChat } from '@chat/types';
import styles from '@chat/components/ChatSidebar/ChatSidebar.module.css';

type ChatSidebarProps = {
  chats: SavedChat[];
  activeChatId: number;
  isSubmitting: boolean;
  onSelectChat: (chatId: number) => void;
  onRenameChat: (chatId: number, title: string) => void;
};

export function ChatSidebar(props: ChatSidebarProps) {
  const { t } = useI18n();
  const [renamingChatId, setRenamingChatId] = createSignal<number | null>(null);
  const [draftTitle, setDraftTitle] = createSignal('');

  const startRenaming = (chat: SavedChat) => {
    setRenamingChatId(chat.id);
    setDraftTitle(chat.title);
  };

  const stopRenaming = () => {
    setRenamingChatId(null);
    setDraftTitle('');
  };

  const submitRename = (event: SubmitEvent, chatId: number) => {
    event.preventDefault();
    props.onRenameChat(chatId, draftTitle());
    stopRenaming();
  };

  return (
    <aside class={styles.sidebar} aria-label={t('chatsLabel')}>
      <h2 class={styles.title}>{t('chatsLabel')}</h2>
      <div class={styles.chatList}>
        <For each={props.chats}>
          {(chat) => (
            <div class={styles.chatRow}>
              <Show
                when={renamingChatId() === chat.id}
                fallback={
                  <>
                    <button
                      class={`${styles.chatButton} ${
                        chat.id === props.activeChatId ? styles.active : ''
                      }`}
                      type="button"
                      disabled={props.isSubmitting}
                      onClick={() => props.onSelectChat(chat.id)}
                    >
                      <span>{chat.title}</span>
                    </button>
                    <button
                      class={styles.renameButton}
                      type="button"
                      disabled={props.isSubmitting}
                      aria-label={t('renameChat')}
                      title={t('renameChat')}
                      onClick={() => startRenaming(chat)}
                    >
                      R
                    </button>
                  </>
                }
              >
                <form class={styles.renameForm} onSubmit={(event) => submitRename(event, chat.id)}>
                  <input
                    class={styles.renameInput}
                    value={draftTitle()}
                    aria-label={t('renameChat')}
                    onInput={(event) => setDraftTitle(event.currentTarget.value)}
                  />
                  <button class={styles.renameAction} type="submit" title={t('saveChatName')}>
                    OK
                  </button>
                  <button
                    class={styles.renameAction}
                    type="button"
                    title={t('cancelRename')}
                    onClick={stopRenaming}
                  >
                    X
                  </button>
                </form>
              </Show>
            </div>
          )}
        </For>
      </div>
    </aside>
  );
}
