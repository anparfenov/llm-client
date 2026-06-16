import { useI18n } from "@lib/i18n";

export type ChatHeaderProps = {
	onNewChat: () => void;
};

export function useChatHeader() {
	const { t } = useI18n();

	return {
		labels: {
			brand: () => t("appBrand"),
			title: () => t("chatTitle"),
			newChat: () => t("newChat"),
		},
	};
}
