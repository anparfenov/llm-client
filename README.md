# LLM Chat

A local-first chat interface built with Solid and Vite. A small Node server serves the production client and streams responses from an OpenAI-compatible API or [Ollama](https://ollama.com/) through same-origin proxies.

## Features

- Streaming assistant responses and optional model thinking
- Locally persisted chat history
- Markdown rendering
- English and Russian interface translations
- Responsive chat layout
- Dependency-free Node proxy with same-origin and CSRF checks

## Prerequisites

- A recent Node.js version with native TypeScript support
- npm
- Access to an OpenAI-compatible Chat Completions API, or Ollama running locally

OpenAI-compatible mode is the default. Configure a model ID and, when the upstream requires it, an API key before starting the app:

```sh
VITE_OPENAI_DEFAULT_MODEL=your-model \
OPENAI_API_KEY=your-api-key \
npm run dev
```

## Getting started

Install dependencies and start the client and server together:

```sh
npm install
npm run dev
```

The command selects available ports starting at `3000` for the server and `5173` for Vite. Open the Vite URL printed in the terminal.

## Configuration

Environment variables can be supplied when running the relevant command.

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_CHAT_PROVIDER` | `openai` | Chat provider: `openai` or `ollama` |
| `VITE_OPENAI_DEFAULT_MODEL` | Required in OpenAI mode | OpenAI-compatible model displayed and sent by the client |
| `OPENAI_API_URL` | `https://api.openai.com/v1` | OpenAI-compatible base URL used by the Node proxy |
| `OPENAI_API_KEY` | Unset | Optional server-only bearer token for the OpenAI-compatible API |
| `OLLAMA_API_URL` | `http://localhost:11434` | Ollama endpoint used by the Node proxy |
| `VITE_OLLAMA_DEFAULT_MODEL` | `qwen3.5:4b` | Model displayed and sent by the client |
| `VITE_CHAT_API_URL` | Same origin | Optional client-side base URL for `/api/chat` and `/chat/completions` |
| `PORT` | First available from `3000` | Node server port |
| `CLIENT_PORT` | First available from `5173` | Vite port used by `npm run dev` |

For a keyless local OpenAI-compatible server:

```sh
VITE_OPENAI_DEFAULT_MODEL=local-model \
OPENAI_API_URL=http://localhost:8080/v1 \
npm run dev
```

The OpenAI-compatible client targets llama.cpp's Chat Completions API. Requests
use Server-Sent Events when streaming, and supported model reasoning is displayed
through the composer thinking toggle. Set `OPENAI_API_URL` to the llama.cpp API
base, including `/v1` when required by your server configuration.

To use Ollama instead:

```sh
ollama pull qwen3.5:4b
VITE_CHAT_PROVIDER=ollama \
OLLAMA_API_URL=http://localhost:11434 \
VITE_OLLAMA_DEFAULT_MODEL=qwen3.5:4b \
npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and the Node proxy with server restart watching |
| `npm run dev:client` | Start only the Vite client |
| `npm run dev:server` | Start only the Node server |
| `npm run build` | Type-check and build the client into `dist/` |
| `npm start` | Serve `dist/` and proxy Ollama requests |
| `npm run lint` | Run Biome lint checks |
| `npm run format` | Format the repository with Biome |

To run the production build locally:

```sh
npm run build
npm start
```

Then open `http://localhost:3000` unless `PORT` is set.

## Project structure

```text
src/                    Solid client
  features/chat/        Chat state, API, pages, and widgets
  lib/i18n/             Localization support
server/index.ts         Static server and streaming provider proxies
scripts/watch.js        Combined development process runner
```

See [AGENTS.md](./AGENTS.md) for repository conventions and coding-agent guidance.
