export const translations = {
  en: {
    appBrand: 'LLM SaaS',
    chatTitle: 'Chat',
    newChat: 'New chat',
    messageInputLabel: 'Message',
    messageInputPlaceholder: 'Message LLM SaaS...',
    sendMessage: 'Send',
    sendingMessage: 'Sending',
    thinkingModeOn: 'Thinking on',
    thinkingModeOff: 'Thinking off',
    thinkingLabel: 'Thinking',
    assistantAvatar: 'AI',
    userAvatar: 'You',
    conversationLabel: 'Conversation',
    initialAssistantMessage: 'Hi. Send a message and I will render it here.',
    pendingAssistantMessage: 'Thinking...',
    ollamaEmptyResponse: 'No response received from Ollama.',
    ollamaConnectionError: 'Unable to reach Ollama. Check that it is running.',
  },
  ru: {
    appBrand: 'LLM SaaS',
    chatTitle: 'Чат',
    newChat: 'Новый чат',
    messageInputLabel: 'Сообщение',
    messageInputPlaceholder: 'Сообщение для LLM SaaS...',
    sendMessage: 'Отправить',
    sendingMessage: 'Отправка',
    thinkingModeOn: 'Думает: вкл',
    thinkingModeOff: 'Думает: выкл',
    thinkingLabel: 'Ход мыслей',
    assistantAvatar: 'ИИ',
    userAvatar: 'Вы',
    conversationLabel: 'Диалог',
    initialAssistantMessage: 'Привет. Отправьте сообщение, и я покажу его здесь.',
    pendingAssistantMessage: 'Думаю...',
    ollamaEmptyResponse: 'Ответ от Ollama не получен.',
    ollamaConnectionError: 'Не удалось подключиться к Ollama. Проверьте, что она запущена.',
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];

export const defaultLocale: Locale = 'en';
