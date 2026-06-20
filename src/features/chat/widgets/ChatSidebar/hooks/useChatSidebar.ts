import type { SavedChat } from "@chat/types";
import type {
	ChatSidebarProps,
	ChatSidebarStyles,
} from "@chat/widgets/ChatSidebar/types";

import { useI18n } from "@lib/i18n";
import { createSignal } from "solid-js";

export function useChatSidebar(
	props: ChatSidebarProps,
	styles: ChatSidebarStyles,
) {
	const { t } = useI18n();
	const [renamingChatId, setRenamingChatId] = createSignal<string | null>(null);
	const [draftTitle, setDraftTitle] = createSignal("");
	const [isCancellingRename, setIsCancellingRename] = createSignal(false);

	const startRenaming = (chat: SavedChat) => {
		setRenamingChatId(chat.id);
		setDraftTitle(chat.title);
	};

	const stopRenaming = () => {
		setRenamingChatId(null);
		setDraftTitle("");
		setIsCancellingRename(false);
	};

	const commitRename = (chatId: string) => {
		if (isCancellingRename()) {
			return;
		}

		props.onRenameChat(chatId, draftTitle());
		stopRenaming();
	};

	const toggleCollapse = () => {
		stopRenaming();
		props.onToggleCollapse();
	};

	const getCollapsedLabel = (chat: SavedChat) => {
		const title = chat.title.trim();

		return (
			title.match(/\p{L}|\p{N}/u)?.[0] ??
			title[0] ??
			"?"
		).toLocaleUpperCase();
	};

	const updateDraftTitle = (
		event: InputEvent & { currentTarget: HTMLInputElement },
	) => {
		setDraftTitle(event.currentTarget.value);
	};

	const handleRenameKeyDown = (
		event: KeyboardEvent & { currentTarget: HTMLInputElement },
	) => {
		if (event.key === "Enter") {
			event.preventDefault();
			event.currentTarget.blur();
		}

		if (event.key === "Escape") {
			event.preventDefault();
			stopRenaming();
		}
	};

	const isActiveChat = (chat: SavedChat) => chat.id === props.activeChatId;
	const isRenaming = (chat: SavedChat) => renamingChatId() === chat.id;
	const sidebarClass = () =>
		`${styles.sidebar} ${props.isCollapsed ? styles.collapsed : ""}`;
	const collapsedChatButtonClass = (chat: SavedChat) =>
		`${styles.collapsedChatButton} ${isActiveChat(chat) ? styles.active : ""}`;
	const chatButtonClass = (chat: SavedChat) =>
		`${styles.chatButton} ${isActiveChat(chat) ? styles.active : ""}`;
	const collapseLabel = () =>
		props.isCollapsed ? t("expandChats") : t("collapseChats");

	return {
		renamingChatId,
		draftTitle,
		labels: {
			chats: () => t("chatsLabel"),
			rename: () => t("renameChat"),
			remove: () => t("removeChat"),
			cancelRename: () => t("cancelRename"),
		},
		sidebarClass,
		collapsedChatButtonClass,
		chatButtonClass,
		collapseLabel,
		collapseIcon: () => (props.isCollapsed ? ">" : "<"),
		isRenaming,
		startRenaming,
		stopRenaming,
		commitRename,
		toggleCollapse,
		getCollapsedLabel,
		updateDraftTitle,
		handleRenameKeyDown,
		selectChat: (chat: SavedChat) => props.onSelectChat(chat.id),
		removeChat: (chat: SavedChat) => props.onRemoveChat(chat.id),
		startCancellingRename: () => setIsCancellingRename(true),
	};
}
