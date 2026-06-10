export type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  status?: 'pending' | 'sent' | 'error';
};

export type SavedChat = {
  id: number;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};
