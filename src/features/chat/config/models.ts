export type ChatModel = {
  id: string;
  label: string;
};

export const chatModels: ChatModel[] = [
  {
    id: import.meta.env.VITE_OLLAMA_DEFAULT_MODEL || 'qwen3.5:4b',
    label: import.meta.env.VITE_OLLAMA_DEFAULT_MODEL || 'qwen3.5:4b',
  },
];

export const defaultChatModel = chatModels[0];

export const ollamaApiUrl = import.meta.env.VITE_CHAT_API_URL || '';
