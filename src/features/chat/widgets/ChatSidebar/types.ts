import type { SavedChat } from "@chat/types";

export type ChatSidebarProps = {
	chats: SavedChat[];
	activeChatId: string;
	isSubmitting: boolean;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
	onNewChat: () => void;
	onSelectChat: (chatId: string) => void;
	onRenameChat: (chatId: string, title: string) => void;
	onRemoveChat: (chatId: string) => void;
};

export type ChatSidebarStyles = Record<string, string>;
