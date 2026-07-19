import type { SubmitChatRequest } from "@chat/api/types";

export function nextAnimationFrame(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => resolve());
	});
}

export function createStreamDeltaBuffer(
	request: SubmitChatRequest,
	delayMs: number,
): {
	addContent: (delta: string) => void;
	addThinking: (delta: string) => void;
	flush: () => void;
} {
	let contentDelta = "";
	let thinkingDelta = "";
	let flushTimeout: ReturnType<typeof setTimeout> | undefined;

	const flush = () => {
		if (flushTimeout) {
			clearTimeout(flushTimeout);
			flushTimeout = undefined;
		}

		if (contentDelta) {
			request.onContentDelta?.(contentDelta);
			contentDelta = "";
		}

		if (thinkingDelta) {
			request.onThinkingDelta?.(thinkingDelta);
			thinkingDelta = "";
		}
	};

	const scheduleFlush = () => {
		flushTimeout ??= setTimeout(flush, delayMs);
	};

	return {
		addContent: (delta: string) => {
			contentDelta += delta;
			scheduleFlush();
		},
		addThinking: (delta: string) => {
			thinkingDelta += delta;
			scheduleFlush();
		},
		flush,
	};
}
