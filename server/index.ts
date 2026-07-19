import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

type JsonBody = Record<string, unknown>;

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = normalize(join(currentDir, ".."));
const distDir = join(projectRoot, "dist");

const port = Number(process.env.PORT || 3000);
const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
const openAIApiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1";
const openAIApiKey = process.env.OPENAI_API_KEY;
const clientDevServerUrl = process.env.CLIENT_DEV_SERVER_URL;
const maxBodySize = 1024 * 1024;

const mimeTypes: Record<string, string> = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".ico": "image/x-icon",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".map": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".txt": "text/plain; charset=utf-8",
	".webmanifest": "application/manifest+json",
};

const server = createServer(async (request, response) => {
	try {
		const url = new URL(request.url || "/", getRequestOrigin(request));

		if (url.pathname === "/api/chat") {
			await proxyChat(request, response, {
				url: joinApiUrl(ollamaApiUrl, "api/chat"),
			});
			return;
		}

		if (url.pathname === "/api/openai/chat") {
			await proxyChat(request, response, {
				url: joinApiUrl(openAIApiUrl, "chat/completions"),
				authorization: openAIApiKey ? `Bearer ${openAIApiKey}` : undefined,
			});
			return;
		}

		if (clientDevServerUrl) {
			redirectToClientDevServer(url, response);
			return;
		}

		await serveStaticFile(url.pathname, response);
	} catch (error) {
		console.error("Server request failed.", error);
		sendJson(response, 500, { error: "Internal server error." });
	}
});

server.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
	console.log(`Proxying Ollama chat requests to ${ollamaApiUrl}/api/chat`);
	console.log(
		`Proxying OpenAI-compatible chat requests to ${joinApiUrl(openAIApiUrl, "chat/completions")}`,
	);

	if (clientDevServerUrl) {
		console.log(`Forwarding client routes to ${clientDevServerUrl}`);
	}
});

async function proxyChat(
	request: IncomingMessage,
	response: ServerResponse,
	upstream: { url: string; authorization?: string },
): Promise<void> {
	if (request.method !== "POST") {
		sendJson(response, 405, { error: "Method not allowed." });
		return;
	}

	if (!isSameOriginRequest(request)) {
		sendJson(response, 403, {
			error: "Cross-origin chat requests are not allowed.",
		});
		return;
	}

	if (request.headers["x-csrf-protection"] !== "1") {
		sendJson(response, 403, { error: "Missing CSRF protection header." });
		return;
	}

	const contentType =
		getFirstHeaderValue(request.headers["content-type"]) || "";

	if (!contentType.includes("application/json")) {
		sendJson(response, 415, { error: "Expected application/json." });
		return;
	}

	const body = await readRequestBody(request);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"Accept-Encoding": "identity",
	};

	if (upstream.authorization) {
		headers.Authorization = upstream.authorization;
	}

	const upstreamResponse = await fetch(upstream.url, {
		method: "POST",
		headers,
		body,
	});

	response.writeHead(upstreamResponse.status, {
		"Cache-Control": "no-store",
		"Content-Type":
			upstreamResponse.headers.get("content-type") ||
			"application/json; charset=utf-8",
		"X-Accel-Buffering": "no",
	});
	response.flushHeaders();

	if (!upstreamResponse.body) {
		response.end();
		return;
	}

	for await (const chunk of upstreamResponse.body) {
		if (!response.write(chunk)) {
			await waitForDrain(response);
		}
	}

	response.end();
}

function joinApiUrl(baseUrl: string, path: string): string {
	return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function waitForDrain(response: ServerResponse): Promise<void> {
	return new Promise((resolve) => {
		response.once("drain", resolve);
	});
}

async function serveStaticFile(
	pathname: string,
	response: ServerResponse,
): Promise<void> {
	const requestedPath =
		pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
	const filePath = normalize(join(distDir, requestedPath));

	if (!filePath.startsWith(distDir)) {
		sendText(response, 403, "Forbidden");
		return;
	}

	const resolvedFilePath = await resolveStaticFile(filePath);
	const fileExtension = extname(resolvedFilePath);

	response.writeHead(200, {
		"Cache-Control":
			fileExtension === ".html"
				? "no-cache"
				: "public, max-age=31536000, immutable",
		"Content-Type": mimeTypes[fileExtension] || "application/octet-stream",
	});
	createReadStream(resolvedFilePath).pipe(response);
}

async function resolveStaticFile(filePath: string): Promise<string> {
	try {
		const fileStats = await stat(filePath);

		if (fileStats.isFile()) {
			return filePath;
		}
	} catch {
		return join(distDir, "index.html");
	}

	return join(distDir, "index.html");
}

function readRequestBody(request: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		let size = 0;
		const chunks: Buffer[] = [];

		request.on("data", (chunk: Buffer | string) => {
			const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			size += buffer.length;

			if (size > maxBodySize) {
				reject(new Error("Request body is too large."));
				request.destroy();
				return;
			}

			chunks.push(buffer);
		});

		request.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
		request.on("error", reject);
	});
}

function isSameOriginRequest(request: IncomingMessage): boolean {
	const expectedOrigin = getRequestOrigin(request);
	const origin = getFirstHeaderValue(request.headers.origin);
	const referer = getFirstHeaderValue(request.headers.referer);

	if (origin) {
		return origin === expectedOrigin;
	}

	if (referer) {
		try {
			return new URL(referer).origin === expectedOrigin;
		} catch {
			return false;
		}
	}

	return true;
}

function getRequestOrigin(request: IncomingMessage): string {
	const host = getFirstHeaderValue(request.headers.host) || `localhost:${port}`;
	const protocol =
		getFirstHeaderValue(request.headers["x-forwarded-proto"]) || "http";

	return `${protocol}://${host}`;
}

function redirectToClientDevServer(url: URL, response: ServerResponse): void {
	const redirectUrl = new URL(clientDevServerUrl || "");
	redirectUrl.pathname = url.pathname;
	redirectUrl.search = url.search;
	response.writeHead(307, {
		"Cache-Control": "no-store",
		Location: redirectUrl.toString(),
	});
	response.end();
}

function getFirstHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	return Array.isArray(header) ? header[0] : header;
}

function sendJson(
	response: ServerResponse,
	statusCode: number,
	body: JsonBody,
): void {
	response.writeHead(statusCode, {
		"Cache-Control": "no-store",
		"Content-Type": "application/json; charset=utf-8",
	});
	response.end(JSON.stringify(body));
}

function sendText(
	response: ServerResponse,
	statusCode: number,
	body: string,
): void {
	response.writeHead(statusCode, {
		"Content-Type": "text/plain; charset=utf-8",
	});
	response.end(body);
}
