import { useI18n } from "@lib/i18n";
import styles from "@chat/components/ChatComposer/ChatComposer.module.css";

type ChatComposerProps = {
	draft: string;
	isSubmitting: boolean;
	isSidebarCollapsed: boolean;
	isThinkingEnabled: boolean;
	onDraftChange: (draft: string) => void;
	onSendMessage: () => Promise<void>;
	onThinkingEnabledChange: (enabled: boolean) => void;
};

export function ChatComposer(props: ChatComposerProps) {
	const { t } = useI18n();

	const submitMessage = (event: SubmitEvent) => {
		event.preventDefault();
		props.onSendMessage();
	};

	return (
		<form
			class={`${styles.composer} ${
				props.isSidebarCollapsed ? styles.composerCollapsed : ""
			}`}
			onSubmit={submitMessage}
		>
			<div class={styles.composerContent}>
				<label class={styles.screenReaderOnly} for="message-input">
					{t("messageInputLabel")}
				</label>
				<textarea
					class={styles.messageInput}
					id="message-input"
					rows="1"
					placeholder={t("messageInputPlaceholder")}
					value={props.draft}
					disabled={props.isSubmitting}
					onInput={(event) => props.onDraftChange(event.currentTarget.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							props.onSendMessage();
						}
					}}
				/>
				<label class={styles.thinkingToggle}>
					<input
						type="checkbox"
						checked={props.isThinkingEnabled}
						disabled={props.isSubmitting}
						onChange={(event) =>
							props.onThinkingEnabledChange(event.currentTarget.checked)
						}
					/>
					<span>
						{props.isThinkingEnabled
							? t("thinkingModeOn")
							: t("thinkingModeOff")}
					</span>
				</label>
				<button
					class={styles.sendButton}
					type="submit"
					disabled={!props.draft.trim() || props.isSubmitting}
				>
					{props.isSubmitting ? t("sendingMessage") : t("sendMessage")}
				</button>
			</div>
		</form>
	);
}
