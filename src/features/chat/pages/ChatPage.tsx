import { createSignal } from 'solid-js';

import { ChatComposer } from '@chat/components/ChatComposer';
import { ChatHeader } from '@chat/components/ChatHeader';
import { ChatSidebar } from '@chat/components/ChatSidebar';
import { MessageList } from '@chat/components/MessageList';
import { useChat } from '@chat/hooks/useChat';
import styles from '@chat/pages/ChatPage.module.css';

export function ChatPage() {
  const chat = useChat();
  const [isChatListCollapsed, setIsChatListCollapsed] = createSignal(false);

  return (
    <main class={`${styles.chatPage} ${isChatListCollapsed() ? styles.chatListCollapsed : ''}`}>
      <ChatSidebar
        chats={chat.chats}
        activeChatId={chat.activeChatId()}
        isSubmitting={chat.isSubmitting()}
        isCollapsed={isChatListCollapsed()}
        onToggleCollapse={() => setIsChatListCollapsed((isCollapsed) => !isCollapsed)}
        onSelectChat={chat.selectChat}
        onRenameChat={chat.renameChat}
        onRemoveChat={chat.removeChat}
      />
      <section class={styles.chatShell}>
        <ChatHeader onNewChat={chat.startNewChat} />
        <MessageList messages={chat.messages} />
        <ChatComposer
          draft={chat.draft()}
          isSubmitting={chat.isSubmitting()}
          isSidebarCollapsed={isChatListCollapsed()}
          isThinkingEnabled={chat.isThinkingEnabled()}
          onDraftChange={chat.setDraft}
          onSendMessage={chat.sendMessage}
          onThinkingEnabledChange={chat.setIsThinkingEnabled}
        />
      </section>
    </main>
  );
}
