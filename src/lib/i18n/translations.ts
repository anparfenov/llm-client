export const translations = {
	en: {
		appBrand: "LLM Chat",
		chatTitle: "Chat",
		chatsLabel: "Chats",
		collapseChats: "Collapse chat list",
		expandChats: "Expand chat list",
		newChat: "New chat",
		untitledChat: "New chat",
		renameChat: "Rename chat",
		removeChat: "Remove chat",
		cancelRename: "Cancel rename",
		messageInputLabel: "Message",
		messageInputPlaceholder: "Message LLM Chat...",
		sendMessage: "Send",
		sendingMessage: "Sending",
		thinkingModeOn: "Thinking on",
		thinkingModeOff: "Thinking off",
		thinkingLabel: "Thinking",
		conversationLabel: "Conversation",
		initialAssistantMessage: "Hi. Send a message and I will render it here.",
		pendingAssistantMessage: "Thinking...",
		openAIEmptyResponse: "No response received from the OpenAI-compatible API.",
		openAIConnectionError:
			"Unable to reach the OpenAI-compatible API. Check its configuration.",
		openAIRequestError:
			"The OpenAI-compatible API could not complete the request.",
		ollamaEmptyResponse: "No response received from Ollama.",
		ollamaConnectionError: "Unable to reach Ollama. Check that it is running.",
		ollamaRequestError: "Ollama could not complete the request.",
	},
	ru: {
		appBrand: "LLM Chat",
		chatTitle: "Чат",
		chatsLabel: "Чаты",
		collapseChats: "Свернуть список чатов",
		expandChats: "Развернуть список чатов",
		newChat: "Новый чат",
		untitledChat: "Новый чат",
		renameChat: "Переименовать чат",
		removeChat: "Удалить чат",
		cancelRename: "Отменить переименование",
		messageInputLabel: "Сообщение",
		messageInputPlaceholder: "Сообщение для LLM Chat...",
		sendMessage: "Отправить",
		sendingMessage: "Отправка",
		thinkingModeOn: "Думает: вкл",
		thinkingModeOff: "Думает: выкл",
		thinkingLabel: "Ход мыслей",
		conversationLabel: "Диалог",
		initialAssistantMessage:
			"Привет. Отправьте сообщение, и я покажу его здесь.",
		pendingAssistantMessage: "Думаю...",
		openAIEmptyResponse: "Ответ от OpenAI-совместимого API не получен.",
		openAIConnectionError:
			"Не удалось подключиться к OpenAI-совместимому API. Проверьте его настройки.",
		openAIRequestError: "OpenAI-совместимый API не смог выполнить запрос.",
		ollamaEmptyResponse: "Ответ от Ollama не получен.",
		ollamaConnectionError:
			"Не удалось подключиться к Ollama. Проверьте, что она запущена.",
		ollamaRequestError: "Ollama не смогла выполнить запрос.",
	},
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["en"];

export const defaultLocale: Locale = "en";
