import { IconButton } from "@chat/widgets/ChatSidebar/components/IconButton/IconButton";
import styles from "@chat/widgets/ChatSidebar/components/NewChatButton/NewChatButton.module.css";
import Plus from "lucide-solid/icons/plus";

type NewChatButtonProps = {
	isCollapsed: boolean;
	isSubmitting: boolean;
	label: string;
	onNewChat: () => void;
};

export function NewChatButton(props: NewChatButtonProps) {
	return (
		<IconButton
			class={`${styles.button} ${props.isCollapsed ? styles.collapsed : ""}`}
			disabled={props.isSubmitting}
			label={props.label}
			layout={props.isCollapsed ? "compact" : "wide"}
			onClick={props.onNewChat}
		>
			{props.isCollapsed ? (
				<Plus size={18} />
			) : (
				<>
					<Plus size={18} />
					<span>{props.label}</span>
				</>
			)}
		</IconButton>
	);
}
