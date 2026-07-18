import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"@chat": fileURLToPath(new URL("./src/features/chat", import.meta.url)),
			"@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
			"@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
		},
	},
	plugins: [solid()],
	server: {
		proxy: {
			"/api": {
				target: process.env.CHAT_PROXY_TARGET || "http://localhost:3000",
				changeOrigin: true,
				headers: {
					origin: process.env.CHAT_PROXY_TARGET || "http://localhost:3000",
				},
			},
		},
	},
});
