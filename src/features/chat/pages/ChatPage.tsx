import { ChatComposer } from '../components/ChatComposer';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { useChat } from '../hooks/useChat';
import styles from './ChatPage.module.css';

export function ChatPage() {
  const chat = useChat();

  return (
    <main class={styles.chatShell}>
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
    </main>
  );
}
