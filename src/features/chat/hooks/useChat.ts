import { submitOllamaChatMessage } from "@chat/api/ollamaChat";
import { defaultChatModel, ollamaApiUrl } from "@chat/config/models";
import { createInitialMessages } from "@chat/data/initialMessages";
import type { ChatTranslate } from "@chat/hooks/types";
import type { Message, SavedChat } from "@chat/types";
import { useI18n } from "@lib/i18n";
import { createSignal } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

const savedChatsStorageKey = "llm-saas.chats";

export function useChat() {
	const { t } = useI18n();
	const initialChats = loadSavedChats(t);
	const [chats, setChats] = createStore<SavedChat[]>(initialChats);
	const [activeChatId, setActiveChatId] = createSignal(initialChats[0].id);
	const [messages, setMessages] = createStore<Message[]>(
		cloneMessages(initialChats[0].messages),
	);
	const [draft, setDraft] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);
	const [selectedModel] = createSignal(defaultChatModel.id);
	const [isThinkingEnabled, setIsThinkingEnabled] = createSignal(false);

	const findActiveChatIndex = () =>
		chats.findIndex((chat) => chat.id === activeChatId());

	const persistChats = () => {
		localStorage.setItem(savedChatsStorageKey, JSON.stringify(chats));
	};

	const appendMessage = (message: Message) => {
		const chatIndex = findActiveChatIndex();

		setMessages(messages.length, message);

		if (chatIndex === -1) {
			return;
		}

		setChats(chatIndex, "messages", chats[chatIndex].messages.length, message);
		setChats(chatIndex, "updatedAt", Date.now());
	};

	const updateActiveChatTitle = (content: string) => {
		const chatIndex = findActiveChatIndex();

		if (
			chatIndex === -1 ||
			chats[chatIndex].messages.some((message) => message.role === "user")
		) {
			return;
		}

		setChats(chatIndex, "title", createChatTitle(content, t));
	};

	const updatePendingMessage = (
		messageId: string,
		getUpdate: (message: Message) => Message,
	) => {
		const messageIndex = messages.findIndex(
			(message) => message.id === messageId,
		);
		const chatIndex = findActiveChatIndex();

		if (messageIndex === -1) {
			return;
		}

		setMessages(messageIndex, getUpdate);

		if (chatIndex !== -1) {
			setChats(chatIndex, "messages", messageIndex, getUpdate);
			setChats(chatIndex, "updatedAt", Date.now());
		}
	};

	const sendMessage = async () => {
		const content = draft().trim();

		if (!content || isSubmitting()) {
			return;
		}

		const userMessageId = createId();
		const pendingMessageId = createId();

		updateActiveChatTitle(content);
		appendMessage({
			id: userMessageId,
			role: "user",
			content,
		});
		appendMessage({
			id: pendingMessageId,
			role: "assistant",
			content: "",
			thinking: "",
			status: "pending",
		});
		persistChats();
		setDraft("");
		setIsSubmitting(true);

		const response = await submitOllamaChatMessage({
			apiUrl: ollamaApiUrl,
			model: selectedModel(),
			messages,
			stream: true,
			fallbackContent: t("ollamaEmptyResponse"),
			connectionErrorContent: t("ollamaConnectionError"),
			requestErrorContent: t("ollamaRequestError"),
			think: isThinkingEnabled(),
			onContentDelta: (delta) => {
				updatePendingMessage(pendingMessageId, (message) => ({
					...message,
					content: message.content + delta,
					status: "pending",
				}));
			},
			onThinkingDelta: (delta) => {
				updatePendingMessage(pendingMessageId, (message) => ({
					...message,
					thinking: `${message.thinking ?? ""}${delta}`,
					status: "pending",
				}));
			},
		});

		updatePendingMessage(pendingMessageId, (message) => ({
			...message,
			content: response.content,
			thinking: response.thinking,
			status: response.isError ? "error" : "sent",
		}));
		persistChats();
		setIsSubmitting(false);
	};

	const startNewChat = () => {
		const nextChat = createSavedChat(t, new Set(chats.map((chat) => chat.id)));

		setChats(chats.length, nextChat);
		setActiveChatId(nextChat.id);
		setMessages(reconcile(cloneMessages(nextChat.messages)));
		setDraft("");
		setIsSubmitting(false);
		persistChats();
	};

	const selectChat = (chatId: string) => {
		const chat = chats.find((savedChat) => savedChat.id === chatId);

		if (!chat || isSubmitting()) {
			return;
		}

		setActiveChatId(chat.id);
		setMessages(reconcile(cloneMessages(chat.messages)));
		setDraft("");
	};

	const renameChat = (chatId: string, title: string) => {
		const chatIndex = chats.findIndex((chat) => chat.id === chatId);
		const nextTitle = createChatTitle(title, t);

		if (chatIndex === -1) {
			return;
		}

		setChats(chatIndex, "title", nextTitle);
		setChats(chatIndex, "updatedAt", Date.now());
		persistChats();
	};

	const removeChat = (chatId: string) => {
		const chatIndex = chats.findIndex((chat) => chat.id === chatId);

		if (chatIndex === -1 || isSubmitting()) {
			return;
		}

		const remainingChats = chats.filter((chat) => chat.id !== chatId);
		const nextChats =
			remainingChats.length > 0
				? remainingChats
				: [createSavedChat(t, new Set(chats.map((chat) => chat.id)))];
		const nextActiveChat =
			chatId === activeChatId()
				? nextChats[Math.min(chatIndex, nextChats.length - 1)]
				: (chats.find((chat) => chat.id === activeChatId()) ?? nextChats[0]);

		setChats(reconcile(nextChats));
		setActiveChatId(nextActiveChat.id);
		setMessages(reconcile(cloneMessages(nextActiveChat.messages)));
		setDraft("");
		localStorage.setItem(savedChatsStorageKey, JSON.stringify(nextChats));
	};

	return {
		chats,
		activeChatId,
		messages,
		draft,
		isSubmitting,
		isThinkingEnabled,
		setDraft,
		setIsThinkingEnabled,
		sendMessage,
		startNewChat,
		selectChat,
		renameChat,
		removeChat,
	};
}

function loadSavedChats(t: ChatTranslate): SavedChat[] {
	const fallbackChat = createSavedChat(t);
	const storedChats = localStorage.getItem(savedChatsStorageKey);

	if (!storedChats) {
		return [fallbackChat];
	}

	try {
		const parsedChats = JSON.parse(storedChats);
		const validChats = Array.isArray(parsedChats)
			? normalizeSavedChats(parsedChats)
			: [];

		return validChats.length > 0 ? validChats : [fallbackChat];
	} catch {
		return [fallbackChat];
	}
}

function createSavedChat(
	t: ChatTranslate,
	existingIds = new Set<string>(),
): SavedChat {
	const now = Date.now();

	return {
		id: createUniqueId(existingIds),
		title: t("untitledChat"),
		messages: createInitialMessages(t),
		createdAt: now,
		updatedAt: now,
	};
}

function createUniqueId(existingIds: Set<string>): string {
	let id = createId();

	while (existingIds.has(id)) {
		id = createId();
	}

	return id;
}

function createId(): string {
	return (
		globalThis.crypto?.randomUUID?.() ??
		`${Date.now()}-${Math.random().toString(36).slice(2)}`
	);
}

function createChatTitle(content: string, t: ChatTranslate): string {
	const title = content.replace(/\s+/g, " ").trim();

	return title ? title.slice(0, 48) : t("untitledChat");
}

function normalizeSavedChats(chats: unknown[]): SavedChat[] {
	const seenChatIds = new Set<string>();

	return chats.flatMap((chat) => {
		const savedChat = normalizeSavedChat(chat);

		if (!savedChat || seenChatIds.has(savedChat.id)) {
			return [];
		}

		seenChatIds.add(savedChat.id);

		return [savedChat];
	});
}

function normalizeSavedChat(chat: unknown): SavedChat | null {
	if (!isRecord(chat)) {
		return null;
	}

	const messages = Array.isArray(chat.messages)
		? chat.messages.flatMap((message) => {
				const normalizedMessage = normalizeMessage(message);

				return normalizedMessage ? [normalizedMessage] : [];
			})
		: [];

	if (
		!isIdLike(chat.id) ||
		typeof chat.title !== "string" ||
		typeof chat.createdAt !== "number" ||
		typeof chat.updatedAt !== "number"
	) {
		return null;
	}

	return {
		id: String(chat.id),
		title: chat.title,
		messages: dedupeMessages(messages),
		createdAt: chat.createdAt,
		updatedAt: chat.updatedAt,
	};
}

function cloneMessages(messages: Message[]): Message[] {
	return messages.map((message) => ({ ...message }));
}

function dedupeMessages(messages: Message[]): Message[] {
	const seenMessageIds = new Set<string>();

	return messages.filter((message) => {
		if (seenMessageIds.has(message.id)) {
			return false;
		}

		seenMessageIds.add(message.id);

		return true;
	});
}

function normalizeMessage(message: unknown): Message | null {
	if (
		!isRecord(message) ||
		!isIdLike(message.id) ||
		(message.role !== "user" && message.role !== "assistant") ||
		typeof message.content !== "string"
	) {
		return null;
	}

	return {
		id: String(message.id),
		role: message.role,
		content: message.content,
		thinking:
			typeof message.thinking === "string" ? message.thinking : undefined,
		status:
			message.status === "pending" ||
			message.status === "sent" ||
			message.status === "error"
				? message.status
				: undefined,
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isIdLike(value: unknown): value is string | number {
	return typeof value === "string" || typeof value === "number";
}
