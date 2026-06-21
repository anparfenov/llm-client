import { useChat } from "@chat/hooks/useChat";
import styles from "@chat/pages/ChatPage.module.css";
import { ChatComposer } from "@chat/widgets/ChatComposer/ChatComposer";
import { ChatSidebar } from "@chat/widgets/ChatSidebar/ChatSidebar";
import { MessageList } from "@chat/widgets/MessageList/MessageList";
import { createSignal } from "solid-js";

const sidebarCollapsedStorageKey = "llm-saas.sidebar-collapsed";

export function ChatPage() {
	const chat = useChat();
	const [isChatListCollapsed, setIsChatListCollapsed] = createSignal(
		localStorage.getItem(sidebarCollapsedStorageKey) === "true",
	);
	const toggleChatList = () => {
		setIsChatListCollapsed((isCollapsed) => {
			const nextIsCollapsed = !isCollapsed;

			localStorage.setItem(
				sidebarCollapsedStorageKey,
				String(nextIsCollapsed),
			);
			return nextIsCollapsed;
		});
	};

	return (
		<main
			class={`${styles.chatPage} ${isChatListCollapsed() ? styles.chatListCollapsed : ""}`}
		>
			<ChatSidebar
				chats={chat.chats}
				activeChatId={chat.activeChatId()}
				isSubmitting={chat.isSubmitting()}
				isCollapsed={isChatListCollapsed()}
				onToggleCollapse={toggleChatList}
				onNewChat={chat.startNewChat}
				onSelectChat={chat.selectChat}
				onRenameChat={chat.renameChat}
				onRemoveChat={chat.removeChat}
			/>
			<section class={styles.chatShell}>
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
