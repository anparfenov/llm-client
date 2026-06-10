import { createSignal } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import { useI18n } from '@lib/i18n';
import { submitOllamaChatMessage } from '@chat/api/ollamaChat';
import { defaultChatModel, ollamaApiUrl } from '@chat/config/models';
import { createInitialMessages } from '@chat/data/initialMessages';
import type { Message, SavedChat } from '@chat/types';

const savedChatsStorageKey = 'llm-saas.chats';

type Translate = ReturnType<typeof useI18n>['t'];

export function useChat() {
  const { t } = useI18n();
  const initialChats = loadSavedChats(t);
  const [chats, setChats] = createStore<SavedChat[]>(initialChats);
  const [activeChatId, setActiveChatId] = createSignal(initialChats[0].id);
  const [messages, setMessages] = createStore<Message[]>(initialChats[0].messages);
  const [draft, setDraft] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [selectedModel] = createSignal(defaultChatModel.id);
  const [isThinkingEnabled, setIsThinkingEnabled] = createSignal(false);

  const findActiveChatIndex = () => chats.findIndex((chat) => chat.id === activeChatId());

  const persistChats = () => {
    localStorage.setItem(savedChatsStorageKey, JSON.stringify(chats));
  };

  const appendMessage = (message: Message) => {
    const chatIndex = findActiveChatIndex();

    setMessages(messages.length, message);

    if (chatIndex === -1) {
      return;
    }

    setChats(chatIndex, 'messages', chats[chatIndex].messages.length, message);
    setChats(chatIndex, 'updatedAt', Date.now());
  };

  const updateActiveChatTitle = (content: string) => {
    const chatIndex = findActiveChatIndex();

    if (chatIndex === -1 || chats[chatIndex].messages.some((message) => message.role === 'user')) {
      return;
    }

    setChats(chatIndex, 'title', createChatTitle(content, t));
  };

  const updatePendingMessage = (messageId: number, getUpdate: (message: Message) => Message) => {
    const messageIndex = messages.findIndex((message) => message.id === messageId);
    const chatIndex = findActiveChatIndex();

    if (messageIndex === -1) {
      return;
    }

    setMessages(messageIndex, getUpdate);

    if (chatIndex !== -1) {
      setChats(chatIndex, 'messages', messageIndex, getUpdate);
      setChats(chatIndex, 'updatedAt', Date.now());
    }
  };

  const sendMessage = async () => {
    const content = draft().trim();

    if (!content || isSubmitting()) {
      return;
    }

    const pendingMessageId = Date.now() + 1;

    updateActiveChatTitle(content);
    appendMessage({
      id: Date.now(),
      role: 'user',
      content,
    });
    appendMessage({
      id: pendingMessageId,
      role: 'assistant',
      content: '',
      thinking: '',
      status: 'pending',
    });
    persistChats();
    setDraft('');
    setIsSubmitting(true);

    const response = await submitOllamaChatMessage({
      apiUrl: ollamaApiUrl,
      model: selectedModel(),
      messages,
      stream: true,
      fallbackContent: t('ollamaEmptyResponse'),
      connectionErrorContent: t('ollamaConnectionError'),
      think: isThinkingEnabled(),
      onContentDelta: (delta) => {
        updatePendingMessage(pendingMessageId, (message) => ({
          ...message,
          content: message.content + delta,
          status: 'pending',
        }));
      },
      onThinkingDelta: (delta) => {
        updatePendingMessage(pendingMessageId, (message) => ({
          ...message,
          thinking: `${message.thinking ?? ''}${delta}`,
          status: 'pending',
        }));
      },
    });

    updatePendingMessage(pendingMessageId, (message) => ({
      ...message,
      content: response.content,
      thinking: response.thinking,
      status: 'sent',
    }));
    persistChats();
    setIsSubmitting(false);
  };

  const startNewChat = () => {
    const nextChat = createSavedChat(t);

    setChats(chats.length, nextChat);
    setActiveChatId(nextChat.id);
    setMessages(reconcile(nextChat.messages));
    setDraft('');
    setIsSubmitting(false);
    persistChats();
  };

  const selectChat = (chatId: number) => {
    const chat = chats.find((savedChat) => savedChat.id === chatId);

    if (!chat || isSubmitting()) {
      return;
    }

    setActiveChatId(chat.id);
    setMessages(reconcile(chat.messages));
    setDraft('');
  };

  const renameChat = (chatId: number, title: string) => {
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);
    const nextTitle = createChatTitle(title, t);

    if (chatIndex === -1) {
      return;
    }

    setChats(chatIndex, 'title', nextTitle);
    setChats(chatIndex, 'updatedAt', Date.now());
    persistChats();
  };

  return {
    chats,
    activeChatId,
    messages,
    draft,
    isSubmitting,
    isThinkingEnabled,
    setDraft,
    setIsThinkingEnabled,
    sendMessage,
    startNewChat,
    selectChat,
    renameChat,
  };
}

function loadSavedChats(t: Translate): SavedChat[] {
  const fallbackChat = createSavedChat(t);
  const storedChats = localStorage.getItem(savedChatsStorageKey);

  if (!storedChats) {
    return [fallbackChat];
  }

  try {
    const parsedChats = JSON.parse(storedChats) as SavedChat[];
    const validChats = parsedChats.filter(isSavedChat);

    return validChats.length > 0 ? validChats : [fallbackChat];
  } catch {
    return [fallbackChat];
  }
}

function createSavedChat(t: Translate): SavedChat {
  const now = Date.now();

  return {
    id: now,
    title: t('untitledChat'),
    messages: createInitialMessages(t),
    createdAt: now,
    updatedAt: now,
  };
}

function createChatTitle(content: string, t: Translate): string {
  const title = content.replace(/\s+/g, ' ').trim();

  return title ? title.slice(0, 48) : t('untitledChat');
}

function isSavedChat(chat: SavedChat): chat is SavedChat {
  return (
    typeof chat?.id === 'number' &&
    typeof chat.title === 'string' &&
    Array.isArray(chat.messages) &&
    typeof chat.createdAt === 'number' &&
    typeof chat.updatedAt === 'number'
  );
}
