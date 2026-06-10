import type { Message } from '@chat/types';

type OllamaRole = 'user' | 'assistant' | 'system';

type OllamaChatMessage = {
  role: OllamaRole;
  content: string;
  thinking?: string;
};

type OllamaChatRequest = {
  model: string;
  messages: OllamaChatMessage[];
  stream: boolean;
  think: boolean;
};

type OllamaChatResponse = {
  done?: boolean;
  message?: OllamaChatMessage;
  error?: string;
};

type SubmitChatRequest = {
  apiUrl: string;
  model: string;
  messages: Message[];
  stream?: boolean;
  fallbackContent: string;
  connectionErrorContent: string;
  think: boolean;
  onContentDelta?: (delta: string) => void;
  onThinkingDelta?: (delta: string) => void;
};

type SubmitChatResponse = {
  content: string;
  thinking?: string;
};

export async function submitOllamaChatMessage(
  request: SubmitChatRequest,
): Promise<SubmitChatResponse> {
  let response: Response;
  const stream = request.stream ?? false;

  try {
    response = await fetch(`${request.apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Protection': '1',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages
          .filter((message) => message.status !== 'pending' && message.status !== 'error')
          .map(toOllamaMessage),
        stream,
        think: request.think,
      } satisfies OllamaChatRequest),
    });
  } catch (error) {
    console.error('Unable to reach Ollama.', error);

    return {
      content: request.connectionErrorContent,
    };
  }

  if (stream) {
    return readOllamaStreamResponse(response, request);
  }

  const data = await readOllamaResponse(response);

  if (!response.ok) {
    console.error('Ollama chat request failed.', data?.error || response.statusText);

    return {
      content: data?.error || request.fallbackContent,
    };
  }

  if (!data) {
    return {
      content: request.fallbackContent,
    };
  }

  if (data.done !== true) {
    console.warn('Ollama response did not complete.', data);
  }

  if (!data.message?.content) {
    console.warn('Ollama returned an empty response.', data);
  }

  return {
    content: data.message?.content || request.fallbackContent,
  };
}

async function readOllamaStreamResponse(
  response: Response,
  request: SubmitChatRequest,
): Promise<SubmitChatResponse> {
  if (!response.ok) {
    const data = await readOllamaResponse(response);

    console.error('Ollama chat request failed.', data?.error || response.statusText);

    return {
      content: data?.error || request.fallbackContent,
    };
  }

  if (!response.body) {
    console.warn('Ollama returned an empty HTTP response.', response.status);

    return {
      content: request.fallbackContent,
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let thinking = '';

  const readLine = (line: string) => {
    const data = parseOllamaJsonLine(line);

    if (!data) {
      return;
    }

    const delta = data.message?.content ?? '';
    const thinkingDelta = data.message?.thinking ?? '';

    if (delta) {
      content += delta;
      request.onContentDelta?.(delta);
    }

    if (thinkingDelta) {
      thinking += thinkingDelta;
      request.onThinkingDelta?.(thinkingDelta);
    }

    if (data.error) {
      console.error('Ollama stream returned an error.', data.error);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        readLine(line);
      }

      await nextAnimationFrame();
    }
  } catch (error) {
    console.error('Unable to read Ollama stream.', error);

    return {
      content: content || request.connectionErrorContent,
      thinking,
    };
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    readLine(buffer);
  }

  if (!content) {
    console.warn('Ollama returned an empty streamed response.');
  }

  return {
    content: content || (thinking ? '' : request.fallbackContent),
    thinking,
  };
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function readOllamaResponse(response: Response): Promise<OllamaChatResponse | null> {
  const text = await response.text();

  if (!text.trim()) {
    console.warn('Ollama returned an empty HTTP response.', response.status);

    return null;
  }

  try {
    return JSON.parse(text) as OllamaChatResponse;
  } catch (error) {
    console.error('Ollama returned invalid JSON.', error);

    return null;
  }
}

function parseOllamaJsonLine(line: string): OllamaChatResponse | null {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return null;
  }

  try {
    return JSON.parse(trimmedLine) as OllamaChatResponse;
  } catch (error) {
    console.error('Ollama returned an invalid stream chunk.', error);

    return null;
  }
}

function toOllamaMessage(message: Message): OllamaChatMessage {
  return {
    role: message.role,
    content: message.content,
  };
}
