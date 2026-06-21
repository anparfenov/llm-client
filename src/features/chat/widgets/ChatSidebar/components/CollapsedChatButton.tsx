import type { SavedChat } from "@chat/types";
import styles from "@chat/widgets/ChatSidebar/ChatSidebar.module.css";

type CollapsedChatButtonProps = {
	chat: SavedChat;
	isActive: boolean;
	isSubmitting: boolean;
	label: string;
	onSelect: () => void;
};

export function CollapsedChatButton(props: CollapsedChatButtonProps) {
	return (
		<button
			class={`${styles.collapsedChatButton} ${props.isActive ? styles.active : ""}`}
			type="button"
			disabled={props.isSubmitting}
			aria-label={props.chat.title}
			title={props.chat.title}
			onClick={props.onSelect}
		>
			{props.label}
		</button>
	);
}
