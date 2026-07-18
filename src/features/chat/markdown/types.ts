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

export type SyntaxTokenType =
	| "comment"
	| "function"
	| "keyword"
	| "literal"
	| "number"
	| "operator"
	| "property"
	| "punctuation"
	| "string"
	| "tag"
	| "text";

export type SyntaxToken = {
	content: string;
	type: SyntaxTokenType;
};
