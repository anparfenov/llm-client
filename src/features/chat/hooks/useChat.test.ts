import { submitChatMessage } from "@chat/api/chat";
import { useChat } from "@chat/hooks/useChat";
import type { SubmitChatResponse } from "@chat/api/types";
import { createRoot } from "solid-js";

vi.mock("@chat/api/chat", () => ({
	submitChatMessage: vi.fn(),
}));

vi.mock("@lib/i18n", () => ({
	useI18n: () => ({
		t: (key: string) => key,
	}),
}));

describe("useChat", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("applies each streamed delta once to active and saved messages", async () => {
		const storedValues = new Map<string, string>();
		vi.stubGlobal("localStorage", {
			getItem: vi.fn((key: string) => storedValues.get(key) ?? null),
			setItem: vi.fn((key: string, value: string) => {
				storedValues.set(key, value);
			}),
		});

		let finishRequest: ((response: SubmitChatResponse) => void) | undefined;
		vi.mocked(submitChatMessage).mockImplementation((_provider, request) => {
			request.onContentDelta?.("Hi");

			return new Promise((resolve) => {
				finishRequest = resolve;
			});
		});

		await new Promise<void>((resolve, reject) => {
			createRoot((dispose) => {
				const chat = useChat();
				chat.setDraft("Hello");
				const sendRequest = chat.sendMessage();
				const activeMessage = chat.messages.at(-1);
				const savedMessage = chat.chats
					.find((savedChat) => savedChat.id === chat.activeChatId())
					?.messages.at(-1);

				try {
					expect(activeMessage?.content).toBe("Hi");
					expect(savedMessage?.content).toBe("Hi");
					finishRequest?.({ content: "Hi" });
				} catch (error) {
					dispose();
					reject(error);
					return;
				}

				sendRequest.then(() => {
					dispose();
					resolve();
				}, reject);
			});
		});
	});
});
