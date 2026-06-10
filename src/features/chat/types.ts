export type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  status?: 'pending' | 'sent' | 'error';
};
