# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is a Solid + Vite chat app with a small Node HTTP server that serves the built client and proxies Ollama chat requests.

- Client source lives in `src/`.
- Chat feature code lives in `src/features/chat/`.
- The server entry is `server/index.ts`.
- Development orchestration is in `scripts/watch.js`.

## Commands

- `npm run build` checks TypeScript and builds the Vite client.
- `npm run dev` starts Vite and the local Node proxy server.
- `npm run dev:client` starts only Vite.
- `npm run dev:server` starts only the server.
- `npm start` runs the server against `dist/`.

Run `npm run build` after code changes unless the edit is documentation-only.

## Architecture Notes

- Chat state and send logic belong in hooks under `src/features/chat/hooks/`.
- Components under `src/features/chat/components/` should stay mostly presentational.
- Each component has its own folder with `index.tsx` and a colocated `*.module.css`.
- Shared app colors and shadows are CSS variables in `src/styles.css`.
- Keep feature imports relative and local to the chat feature where possible.

## Streaming Chat Behavior

- Ollama requests are made in `src/features/chat/api/ollamaChat.ts`.
- The server proxy in `server/index.ts` should preserve streaming. Avoid buffering proxy responses.
- The UI supports both `message.content` and `message.thinking` streaming.
- Thinking is disabled by default in `useChat`, but users can toggle it in the composer.
- `MessageList` auto-scrolls while the latest message streams.

## Solid Conventions

- Use `createStore` for message arrays when path updates are useful.
- Prefer store path updates such as `setMessages(messages.length, message)` for appending messages.
- Do not mutate signal arrays in place unless the state primitive is designed for that mutation pattern.
- Keep derived presentation logic in small hooks when it would otherwise clutter components.

## Styling

- Use CSS Modules for component styles.
- Use semantic CSS variables from `src/styles.css` instead of raw color values in component CSS.
- Keep global CSS limited to app-wide resets, base element styles, and design tokens.

## Server Notes

- The server runs as TypeScript via Node's native TypeScript support.
- Keep the server dependency-free unless a new dependency is clearly justified.
- Preserve same-origin and CSRF checks for `/api/chat`.
- Preserve `X-Accel-Buffering: no`, no-store cache headers, and streaming writes for Ollama responses.
