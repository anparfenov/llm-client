import styles from "@chat/widgets/ChatSidebar/ChatSidebar.module.css";

import { ChatListItem } from "@chat/widgets/ChatSidebar/components/ChatListItem";
import { CollapsedChatButton } from "@chat/widgets/ChatSidebar/components/CollapsedChatButton";
import { useChatSidebar } from "@chat/widgets/ChatSidebar/hooks/useChatSidebar";
import type { ChatSidebarProps } from "@chat/widgets/ChatSidebar/types";
import PanelLeftClose from "lucide-solid/icons/panel-left-close";
import PanelLeftOpen from "lucide-solid/icons/panel-left-open";
import Plus from "lucide-solid/icons/plus";
import { For, Show } from "solid-js";

export function ChatSidebar(props: ChatSidebarProps) {
	const sidebar = useChatSidebar(props, styles);

	return (
		<aside class={sidebar.sidebarClass()} aria-label={sidebar.labels.chats()}>
			<div class={styles.header}>
				<Show when={!props.isCollapsed}>
					<div>
						<p class={styles.eyebrow}>{sidebar.labels.brand()}</p>
						<h1 class={styles.title}>{sidebar.labels.title()}</h1>
					</div>
				</Show>
				<button
					class={styles.collapseButton}
					type="button"
					aria-expanded={!props.isCollapsed}
					aria-label={sidebar.collapseLabel()}
					title={sidebar.collapseLabel()}
					onClick={sidebar.toggleCollapse}
				>
					<Show when={props.isCollapsed} fallback={<PanelLeftClose size={18} />}>
						<PanelLeftOpen size={18} />
					</Show>
				</button>
			</div>
			<button
				class={styles.newChatButton}
				type="button"
				disabled={props.isSubmitting}
				aria-label={sidebar.labels.newChat()}
				title={sidebar.labels.newChat()}
				onClick={props.onNewChat}
			>
				<Plus size={18} />
				<Show when={!props.isCollapsed}>
					<span>{sidebar.labels.newChat()}</span>
				</Show>
			</button>
			<Show when={props.isCollapsed}>
				<div class={styles.collapsedChatList}>
					<For each={props.chats}>
						{(chat) => (
							<CollapsedChatButton
								chat={chat}
								isActive={sidebar.isActiveChat(chat)}
								isSubmitting={props.isSubmitting}
								label={sidebar.getCollapsedLabel(chat)}
								onSelect={() => sidebar.selectChat(chat)}
							/>
						)}
					</For>
				</div>
			</Show>
			<Show when={!props.isCollapsed}>
				<h2 class={styles.chatListTitle}>{sidebar.labels.chats()}</h2>
				<div class={styles.chatList}>
					<For each={props.chats}>
						{(chat) => (
							<ChatListItem
								chat={chat}
								isActive={sidebar.isActiveChat(chat)}
								isRenaming={sidebar.isRenaming(chat)}
								isSubmitting={props.isSubmitting}
								draftTitle={sidebar.draftTitle()}
								renameLabel={sidebar.labels.rename()}
								removeLabel={sidebar.labels.remove()}
								cancelRenameLabel={sidebar.labels.cancelRename()}
								onSelect={() => sidebar.selectChat(chat)}
								onStartRenaming={() => sidebar.startRenaming(chat)}
								onRemove={() => sidebar.removeChat(chat)}
								onDraftTitleInput={sidebar.updateDraftTitle}
								onCommitRename={() => sidebar.commitRename(chat.id)}
								onRenameKeyDown={sidebar.handleRenameKeyDown}
								onStartCancellingRename={sidebar.startCancellingRename}
								onCancelRename={sidebar.stopRenaming}
							/>
						)}
					</For>
				</div>
			</Show>
		</aside>
	);
}
