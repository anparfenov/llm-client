import type { JSX } from "solid-js";

export type MarkdownContentProps = {
	content: string;
	isStreaming?: boolean;
};

export type UseMarkdownContentProps = MarkdownContentProps;

export type Block =
	| { type: "blockquote"; content: string[] }
	| { type: "code"; code: string; isOpen?: boolean; language?: string }
	| { type: "heading"; depth: number; content: string }
	| { type: "list"; ordered: boolean; items: string[] }
	| { type: "paragraph"; content: string }
	| {
			type: "table";
			alignments: TableAlignment[];
			headers: string[];
			rows: string[][];
	  };

export type TableAlignment = "center" | "left" | "right" | undefined;

export type InlineSegment =
	| { type: "bold"; content: string }
	| { type: "code"; content: string }
	| { type: "italic"; content: string }
	| { type: "link"; content: string; href: string }
	| { type: "text"; content: string };

export type RenderedMarkdownBlock = JSX.Element;
