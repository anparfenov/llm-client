import styles from "@chat/widgets/ChatComposer/ChatComposer.module.css";
import {
	type ChatComposerProps,
	useChatComposer,
} from "@chat/widgets/ChatComposer/hooks/useChatComposer";

export function ChatComposer(props: ChatComposerProps) {
	const composer = useChatComposer(props, styles);

	return (
		<form class={composer.composerClass()} onSubmit={composer.submitMessage}>
			<div class={styles.composerContent}>
				<label class={styles.screenReaderOnly} for="message-input">
					{composer.labels.messageInput()}
				</label>
				<textarea
					class={styles.messageInput}
					id="message-input"
					rows="1"
					placeholder={composer.labels.messagePlaceholder()}
					value={props.draft}
					disabled={props.isSubmitting}
					onInput={composer.updateDraft}
					onKeyDown={composer.submitOnEnter}
				/>
				<label class={styles.thinkingToggle}>
					<input
						type="checkbox"
						checked={props.isThinkingEnabled}
						disabled={props.isSubmitting}
						onChange={composer.updateThinkingMode}
					/>
					<span>{composer.labels.thinkingMode()}</span>
				</label>
				<button
					class={styles.sendButton}
					type="submit"
					disabled={composer.isSendDisabled()}
				>
					{composer.labels.sendButton()}
				</button>
			</div>
		</form>
	);
}
