import type { SavedChat } from "@chat/types";
import { IconButton } from "@chat/widgets/ChatSidebar/components/IconButton/IconButton";
import styles from "@chat/widgets/ChatSidebar/components/CollapsedChatButton/CollapsedChatButton.module.css";

type CollapsedChatButtonProps = {
	chat: SavedChat;
	isActive: boolean;
	isSubmitting: boolean;
	label: string;
	onSelect: () => void;
};

export function CollapsedChatButton(props: CollapsedChatButtonProps) {
	return (
		<IconButton
			class={styles.button}
			disabled={props.isSubmitting}
			isActive={props.isActive}
			label={props.chat.title}
			layout="compact"
			onClick={props.onSelect}
		>
			{props.label}
		</IconButton>
	);
}
