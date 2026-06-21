import type { SavedChat } from "@chat/types";
import styles from "@chat/widgets/ChatSidebar/ChatSidebar.module.css";
import Pencil from "lucide-solid/icons/pencil";
import Trash2 from "lucide-solid/icons/trash-2";
import X from "lucide-solid/icons/x";
import { Show } from "solid-js";

type ChatListItemProps = {
	chat: SavedChat;
	isActive: boolean;
	isRenaming: boolean;
	isSubmitting: boolean;
	draftTitle: string;
	renameLabel: string;
	removeLabel: string;
	cancelRenameLabel: string;
	onSelect: () => void;
	onStartRenaming: () => void;
	onRemove: () => void;
	onDraftTitleInput: (
		event: InputEvent & { currentTarget: HTMLInputElement },
	) => void;
	onCommitRename: () => void;
	onRenameKeyDown: (
		event: KeyboardEvent & { currentTarget: HTMLInputElement },
	) => void;
	onStartCancellingRename: () => void;
	onCancelRename: () => void;
};

export function ChatListItem(props: ChatListItemProps) {
	return (
		<div class={styles.chatRow}>
			<Show
				when={props.isRenaming}
				fallback={
					<>
						<button
							class={`${styles.chatButton} ${props.isActive ? styles.active : ""}`}
							type="button"
							disabled={props.isSubmitting}
							onClick={props.onSelect}
						>
							<span>{props.chat.title}</span>
						</button>
						<button
							class={styles.renameButton}
							type="button"
							disabled={props.isSubmitting}
							aria-label={props.renameLabel}
							title={props.renameLabel}
							onClick={props.onStartRenaming}
						>
							<Pencil size={16} />
						</button>
						<button
							class={styles.removeButton}
							type="button"
							disabled={props.isSubmitting}
							aria-label={props.removeLabel}
							title={props.removeLabel}
							onClick={props.onRemove}
						>
							<Trash2 size={16} />
						</button>
					</>
				}
			>
				<div class={styles.renameForm}>
					<input
						class={styles.renameInput}
						value={props.draftTitle}
						aria-label={props.renameLabel}
						onInput={props.onDraftTitleInput}
						onBlur={props.onCommitRename}
						onKeyDown={props.onRenameKeyDown}
					/>
					<button
						class={styles.renameAction}
						type="button"
						aria-label={props.cancelRenameLabel}
						title={props.cancelRenameLabel}
						onPointerDown={props.onStartCancellingRename}
						onClick={props.onCancelRename}
					>
						<X size={16} />
					</button>
				</div>
			</Show>
		</div>
	);
}
