import styles from "@chat/widgets/ChatSidebar/ChatSidebar.module.css";

import { ChatListItem } from "@chat/widgets/ChatSidebar/components/ChatListItem";
import { CollapsedChatButton } from "@chat/widgets/ChatSidebar/components/CollapsedChatButton/CollapsedChatButton";
import { IconButton } from "@chat/widgets/ChatSidebar/components/IconButton/IconButton";
import { NewChatButton } from "@chat/widgets/ChatSidebar/components/NewChatButton/NewChatButton";
import { useChatSidebar } from "@chat/widgets/ChatSidebar/hooks/useChatSidebar";
import type { ChatSidebarProps } from "@chat/widgets/ChatSidebar/types";
import PanelLeftClose from "lucide-solid/icons/panel-left-close";
import PanelLeftOpen from "lucide-solid/icons/panel-left-open";
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
				<IconButton
					ariaExpanded={!props.isCollapsed}
					label={sidebar.collapseLabel()}
					layout="compact"
					onClick={sidebar.toggleCollapse}
				>
					<Show
						when={props.isCollapsed}
						fallback={<PanelLeftClose size={18} />}
					>
						<PanelLeftOpen size={18} />
					</Show>
				</IconButton>
			</div>
			<NewChatButton
				isCollapsed={props.isCollapsed}
				isSubmitting={props.isSubmitting}
				label={sidebar.labels.newChat()}
				onNewChat={props.onNewChat}
			/>
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
