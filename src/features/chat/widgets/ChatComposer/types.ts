export type ChatComposerProps = {
	draft: string;
	isSubmitting: boolean;
	isSidebarCollapsed: boolean;
	isThinkingEnabled: boolean;
	onDraftChange: (draft: string) => void;
	onSendMessage: () => Promise<void>;
	onThinkingEnabledChange: (enabled: boolean) => void;
};

export type ChatComposerStyles = Record<string, string>;
