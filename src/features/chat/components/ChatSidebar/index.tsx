import { createSignal, For, Show } from "solid-js";

import { useI18n } from "@lib/i18n";
import type { SavedChat } from "@chat/types";
import styles from "@chat/components/ChatSidebar/ChatSidebar.module.css";

type ChatSidebarProps = {
	chats: SavedChat[];
	activeChatId: string;
	isSubmitting: boolean;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
	onSelectChat: (chatId: string) => void;
	onRenameChat: (chatId: string, title: string) => void;
	onRemoveChat: (chatId: string) => void;
};

export function ChatSidebar(props: ChatSidebarProps) {
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

	return (
		<aside
			class={`${styles.sidebar} ${props.isCollapsed ? styles.collapsed : ""}`}
			aria-label={t("chatsLabel")}
		>
			<div class={styles.header}>
				<Show when={!props.isCollapsed}>
					<h2 class={styles.title}>{t("chatsLabel")}</h2>
				</Show>
				<button
					class={styles.collapseButton}
					type="button"
					aria-expanded={!props.isCollapsed}
					aria-label={props.isCollapsed ? t("expandChats") : t("collapseChats")}
					title={props.isCollapsed ? t("expandChats") : t("collapseChats")}
					onClick={toggleCollapse}
				>
					{props.isCollapsed ? ">" : "<"}
				</button>
			</div>
			<Show
				when={!props.isCollapsed}
				fallback={
					<div class={styles.collapsedChatList}>
						<For each={props.chats}>
							{(chat) => (
								<button
									class={`${styles.collapsedChatButton} ${
										chat.id === props.activeChatId ? styles.active : ""
									}`}
									type="button"
									disabled={props.isSubmitting}
									aria-label={chat.title}
									title={chat.title}
									onClick={() => props.onSelectChat(chat.id)}
								>
									{getCollapsedLabel(chat)}
								</button>
							)}
						</For>
					</div>
				}
			>
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
													chat.id === props.activeChatId ? styles.active : ""
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
												aria-label={t("renameChat")}
												title={t("renameChat")}
												onClick={() => startRenaming(chat)}
											>
												R
											</button>
											<button
												class={styles.removeButton}
												type="button"
												disabled={props.isSubmitting}
												aria-label={t("removeChat")}
												title={t("removeChat")}
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
											aria-label={t("renameChat")}
											onInput={(event) =>
												setDraftTitle(event.currentTarget.value)
											}
											onBlur={() => commitRename(chat.id)}
											onKeyDown={(event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													event.currentTarget.blur();
												}

												if (event.key === "Escape") {
													event.preventDefault();
													stopRenaming();
												}
											}}
										/>
										<button
											class={styles.renameAction}
											type="button"
											title={t("cancelRename")}
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
			</Show>
		</aside>
	);
}
