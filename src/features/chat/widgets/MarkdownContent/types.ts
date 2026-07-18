export type MarkdownContentProps = {
	content: string;
	isStreaming?: boolean;
};

export type UseMarkdownContentProps = MarkdownContentProps;

export type InlineSegment =
	| { type: "bold"; content: string }
	| { type: "code"; content: string }
	| { type: "italic"; content: string }
	| { type: "link"; content: string; href: string }
	| { type: "text"; content: string };
