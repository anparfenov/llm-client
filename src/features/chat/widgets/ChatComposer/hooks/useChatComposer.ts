import { useI18n } from "@lib/i18n";

export type ChatComposerProps = {
	draft: string;
	isSubmitting: boolean;
	isSidebarCollapsed: boolean;
	isThinkingEnabled: boolean;
	onDraftChange: (draft: string) => void;
	onSendMessage: () => Promise<void>;
	onThinkingEnabledChange: (enabled: boolean) => void;
};

type ChatComposerStyles = Record<string, string>;

export function useChatComposer(
	props: ChatComposerProps,
	styles: ChatComposerStyles,
) {
	const { t } = useI18n();

	const submitMessage = (event: SubmitEvent) => {
		event.preventDefault();
		props.onSendMessage();
	};

	const updateDraft = (
		event: InputEvent & { currentTarget: HTMLTextAreaElement },
	) => {
		props.onDraftChange(event.currentTarget.value);
	};

	const submitOnEnter = (
		event: KeyboardEvent & { currentTarget: HTMLTextAreaElement },
	) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			props.onSendMessage();
		}
	};

	const updateThinkingMode = (
		event: Event & { currentTarget: HTMLInputElement },
	) => {
		props.onThinkingEnabledChange(event.currentTarget.checked);
	};

	return {
		composerClass: () =>
			`${styles.composer} ${
				props.isSidebarCollapsed ? styles.composerCollapsed : ""
			}`,
		labels: {
			messageInput: () => t("messageInputLabel"),
			messagePlaceholder: () => t("messageInputPlaceholder"),
			thinkingMode: () =>
				props.isThinkingEnabled ? t("thinkingModeOn") : t("thinkingModeOff"),
			sendButton: () =>
				props.isSubmitting ? t("sendingMessage") : t("sendMessage"),
		},
		submitMessage,
		updateDraft,
		submitOnEnter,
		updateThinkingMode,
		isSendDisabled: () => !props.draft.trim() || props.isSubmitting,
	};
}
