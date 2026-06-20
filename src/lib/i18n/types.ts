import type { Accessor, JSX } from "solid-js";

import type { Locale, TranslationKey } from "@lib/i18n/translations";

export type I18nContextValue = {
	locale: Accessor<Locale>;
	t: (key: TranslationKey) => string;
};

export type I18nProviderProps = {
	children: JSX.Element;
};
