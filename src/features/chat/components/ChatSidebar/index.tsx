import { createSignal, For, Show } from 'solid-js';

import { useI18n } from '@lib/i18n';
import type { SavedChat } from '@chat/types';
import styles from '@chat/components/ChatSidebar/ChatSidebar.module.css';

type ChatSidebarProps = {
  chats: SavedChat[];
  activeChatId: string;
  isSubmitting: boolean;
  onSelectChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  onRemoveChat: (chatId: string) => void;
};

export function ChatSidebar(props: ChatSidebarProps) {
  const { t } = useI18n();
  const [renamingChatId, setRenamingChatId] = createSignal<string | null>(null);
  const [draftTitle, setDraftTitle] = createSignal('');
  const [isCancellingRename, setIsCancellingRename] = createSignal(false);

  const startRenaming = (chat: SavedChat) => {
    setRenamingChatId(chat.id);
    setDraftTitle(chat.title);
  };

  const stopRenaming = () => {
    setRenamingChatId(null);
    setDraftTitle('');
    setIsCancellingRename(false);
  };

  const commitRename = (chatId: string) => {
    if (isCancellingRename()) {
      return;
    }

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
                    <button
                      class={styles.removeButton}
                      type="button"
                      disabled={props.isSubmitting}
                      aria-label={t('removeChat')}
                      title={t('removeChat')}
                      onClick={() => props.onRemoveChat(chat.id)}
                    >
                      X
                    </button>
                  </>
                }
              >
                <div class={styles.renameForm}>
                  <input
                    class={styles.renameInput}
                    value={draftTitle()}
                    aria-label={t('renameChat')}
                    onInput={(event) => setDraftTitle(event.currentTarget.value)}
                    onBlur={() => commitRename(chat.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        event.currentTarget.blur();
                      }

                      if (event.key === 'Escape') {
                        event.preventDefault();
                        stopRenaming();
                      }
                    }}
                  />
                  <button
                    class={styles.renameAction}
                    type="button"
                    title={t('cancelRename')}
                    onPointerDown={() => setIsCancellingRename(true)}
                    onClick={stopRenaming}
                  >
                    X
                  </button>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </aside>
  );
}
