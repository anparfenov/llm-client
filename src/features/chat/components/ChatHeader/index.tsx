import { useI18n } from "@lib/i18n";
import styles from "@chat/components/ChatHeader/ChatHeader.module.css";

type ChatHeaderProps = {
	onNewChat: () => void;
};

export function ChatHeader(props: ChatHeaderProps) {
	const { t } = useI18n();

	return (
		<header class={styles.chatHeader}>
			<div>
				<p class={styles.eyebrow}>{t("appBrand")}</p>
				<h1 class={styles.title}>{t("chatTitle")}</h1>
			</div>
			<button
				class={styles.newChatButton}
				type="button"
				onClick={props.onNewChat}
			>
				{t("newChat")}
			</button>
		</header>
	);
}
