import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  server: {
    proxy: {
      '/api': {
        target: process.env.CHAT_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        headers: {
          origin: process.env.CHAT_PROXY_TARGET || 'http://localhost:3000',
        },
      },
    },
  },
});
