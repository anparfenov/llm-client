import styles from "@chat/widgets/ChatComposer/ChatComposer.module.css";
import { useChatComposer } from "@chat/widgets/ChatComposer/hooks/useChatComposer";
import type { ChatComposerProps } from "@chat/widgets/ChatComposer/types";
import Send from "lucide-solid/icons/send";

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
					aria-label={composer.labels.sendButton()}
					title={composer.labels.sendButton()}
				>
					<Send size={18} />
				</button>
			</div>
		</form>
	);
}
