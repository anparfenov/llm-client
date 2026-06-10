import type { TranslationKey } from '../../../lib/i18n';
import type { Message } from '../types';

type Translate = (key: TranslationKey) => string;

export const createInitialMessages = (t: Translate): Message[] => [
  {
    id: 1,
    role: 'assistant',
    content: t('initialAssistantMessage'),
  },
];
