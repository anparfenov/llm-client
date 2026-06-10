import { createSignal } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import { useI18n } from '../../../lib/i18n';
import { submitOllamaChatMessage } from '../api/ollamaChat';
import { defaultChatModel, ollamaApiUrl } from '../config/models';
import { createInitialMessages } from '../data/initialMessages';
import type { Message } from '../types';

export function useChat() {
  const { t } = useI18n();
  const [messages, setMessages] = createStore<Message[]>(createInitialMessages(t));
  const [draft, setDraft] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [selectedModel] = createSignal(defaultChatModel.id);
  const [isThinkingEnabled, setIsThinkingEnabled] = createSignal(false);

  const updatePendingMessage = (messageId: number, getUpdate: (message: Message) => Message) => {
    const messageIndex = messages.findIndex((message) => message.id === messageId);

    if (messageIndex === -1) {
      return;
    }

    setMessages(messageIndex, getUpdate);
  };

  const sendMessage = async () => {
    const content = draft().trim();

    if (!content || isSubmitting()) {
      return;
    }

    const pendingMessageId = Date.now() + 1;

    setMessages(messages.length, {
      id: Date.now(),
      role: 'user',
      content,
    });

    setMessages(messages.length, {
      id: pendingMessageId,
      role: 'assistant',
      content: '',
      thinking: '',
      status: 'pending',
    });

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
    setIsSubmitting(false);
  };

  const startNewChat = () => {
    setMessages(reconcile(createInitialMessages(t)));
    setDraft('');
    setIsSubmitting(false);
  };

  return {
    messages,
    draft,
    isSubmitting,
    isThinkingEnabled,
    setDraft,
    setIsThinkingEnabled,
    sendMessage,
    startNewChat,
  };
}
