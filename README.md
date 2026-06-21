# LLM Chat

A local-first chat interface built with Solid and Vite. A small Node server serves the production client and streams chat responses from [Ollama](https://ollama.com/) through a same-origin API proxy.

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
- Ollama running locally, or access to a compatible Ollama endpoint

The default model is `qwen3.5:4b`. Make sure it is available in Ollama before starting the app:

```sh
ollama pull qwen3.5:4b
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
| `OLLAMA_API_URL` | `http://localhost:11434` | Ollama endpoint used by the Node proxy |
| `VITE_OLLAMA_DEFAULT_MODEL` | `qwen3.5:4b` | Model displayed and sent by the client |
| `VITE_CHAT_API_URL` | Same origin | Optional client-side base URL for `/api/chat` |
| `PORT` | First available from `3000` | Node server port |
| `CLIENT_PORT` | First available from `5173` | Vite port used by `npm run dev` |

For example:

```sh
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
server/index.ts         Static server and streaming Ollama proxy
scripts/watch.js        Combined development process runner
```

See [AGENTS.md](./AGENTS.md) for repository conventions and coding-agent guidance.
