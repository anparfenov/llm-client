import styles from "@chat/widgets/ChatSidebar/ChatSidebar.module.css";

import {
	type ChatSidebarProps,
	useChatSidebar,
} from "@chat/widgets/ChatSidebar/hooks/useChatSidebar";
import { For, Show } from "solid-js";

export function ChatSidebar(props: ChatSidebarProps) {
	const sidebar = useChatSidebar(props, styles);

	return (
		<aside class={sidebar.sidebarClass()} aria-label={sidebar.labels.chats()}>
			<div class={styles.header}>
				<Show when={!props.isCollapsed}>
					<h2 class={styles.title}>{sidebar.labels.chats()}</h2>
				</Show>
				<button
					class={styles.collapseButton}
					type="button"
					aria-expanded={!props.isCollapsed}
					aria-label={sidebar.collapseLabel()}
					title={sidebar.collapseLabel()}
					onClick={sidebar.toggleCollapse}
				>
					{sidebar.collapseIcon()}
				</button>
			</div>
			<Show when={props.isCollapsed}>
				<div class={styles.collapsedChatList}>
					<For each={props.chats}>
						{(chat) => (
							<button
								class={sidebar.collapsedChatButtonClass(chat)}
								type="button"
								disabled={props.isSubmitting}
								aria-label={chat.title}
								title={chat.title}
								onClick={() => sidebar.selectChat(chat)}
							>
								{sidebar.getCollapsedLabel(chat)}
							</button>
						)}
					</For>
				</div>
			</Show>
			<Show when={!props.isCollapsed}>
				<div class={styles.chatList}>
					<For each={props.chats}>
						{(chat) => (
							<div class={styles.chatRow}>
								<Show
									when={sidebar.isRenaming(chat)}
									fallback={
										<>
											<button
												class={sidebar.chatButtonClass(chat)}
												type="button"
												disabled={props.isSubmitting}
												onClick={() => sidebar.selectChat(chat)}
											>
												<span>{chat.title}</span>
											</button>
											<button
												class={styles.renameButton}
												type="button"
												disabled={props.isSubmitting}
												aria-label={sidebar.labels.rename()}
												title={sidebar.labels.rename()}
												onClick={() => sidebar.startRenaming(chat)}
											>
												R
											</button>
											<button
												class={styles.removeButton}
												type="button"
												disabled={props.isSubmitting}
												aria-label={sidebar.labels.remove()}
												title={sidebar.labels.remove()}
												onClick={() => sidebar.removeChat(chat)}
											>
												X
											</button>
										</>
									}
								>
									<div class={styles.renameForm}>
										<input
											class={styles.renameInput}
											value={sidebar.draftTitle()}
											aria-label={sidebar.labels.rename()}
											onInput={sidebar.updateDraftTitle}
											onBlur={() => sidebar.commitRename(chat.id)}
											onKeyDown={sidebar.handleRenameKeyDown}
										/>
										<button
											class={styles.renameAction}
											type="button"
											title={sidebar.labels.cancelRename()}
											onPointerDown={sidebar.startCancellingRename}
											onClick={sidebar.stopRenaming}
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
