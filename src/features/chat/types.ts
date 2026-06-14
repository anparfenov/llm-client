export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  status?: 'pending' | 'sent' | 'error';
};

export type SavedChat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};
