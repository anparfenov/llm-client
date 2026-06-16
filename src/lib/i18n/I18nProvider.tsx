import {
	createContext,
	createSignal,
	useContext,
	type Accessor,
	type JSX,
} from "solid-js";

import {
	defaultLocale,
	translations,
	type Locale,
	type TranslationKey,
} from "@lib/i18n/translations";

type I18nContextValue = {
	locale: Accessor<Locale>;
	t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue>();

type I18nProviderProps = {
	children: JSX.Element;
};

export function I18nProvider(props: I18nProviderProps) {
	const [locale] = createSignal(getInitialLocale());

	const t = (key: TranslationKey) =>
		translations[locale()][key] ?? translations[defaultLocale][key];

	return (
		<I18nContext.Provider value={{ locale, t }}>
			{props.children}
		</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("I18nProvider is missing");
	}

	return context;
}

function getInitialLocale(): Locale {
	const browserLocale = navigator.language.split("-")[0] as Locale;

	return browserLocale in translations ? browserLocale : defaultLocale;
}
