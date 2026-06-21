import styles from "@chat/widgets/ChatSidebar/components/IconButton/IconButton.module.css";
import type { JSX } from "solid-js";

type IconButtonProps = {
	ariaExpanded?: boolean;
	children: JSX.Element;
	class?: string;
	disabled?: boolean;
	isActive?: boolean;
	label: string;
	layout: "compact" | "wide";
	onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
};

export function IconButton(props: IconButtonProps) {
	return (
		<button
			class={`${styles.button} ${styles[props.layout]} ${props.isActive ? styles.active : ""} ${props.class ?? ""}`}
			type="button"
			disabled={props.disabled}
			aria-expanded={props.ariaExpanded}
			aria-label={props.label}
			title={props.label}
			onClick={props.onClick}
		>
			{props.children}
		</button>
	);
}
