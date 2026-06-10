import { ChatComposer } from '@chat/components/ChatComposer';
import { ChatHeader } from '@chat/components/ChatHeader';
import { ChatSidebar } from '@chat/components/ChatSidebar';
import { MessageList } from '@chat/components/MessageList';
import { useChat } from '@chat/hooks/useChat';
import styles from '@chat/pages/ChatPage.module.css';

export function ChatPage() {
  const chat = useChat();

  return (
    <main class={styles.chatPage}>
      <ChatSidebar
        chats={chat.chats}
        activeChatId={chat.activeChatId()}
        isSubmitting={chat.isSubmitting()}
        onSelectChat={chat.selectChat}
        onRenameChat={chat.renameChat}
      />
      <section class={styles.chatShell}>
        <ChatHeader onNewChat={chat.startNewChat} />
        <MessageList messages={chat.messages} />
        <ChatComposer
          draft={chat.draft()}
          isSubmitting={chat.isSubmitting()}
          isThinkingEnabled={chat.isThinkingEnabled()}
          onDraftChange={chat.setDraft}
          onSendMessage={chat.sendMessage}
          onThinkingEnabledChange={chat.setIsThinkingEnabled}
        />
      </section>
    </main>
  );
}
