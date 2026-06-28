import type { Block } from "../../../types";

export type MarkdownParsingTestCase = {
	expected: Block[];
	isStreaming?: boolean;
	markdown: string;
	name: string;
};

const typescriptCode = [
	"type User = {",
	"  id: number;",
	"  name: string;",
	"  active: boolean;",
	"};",
	"",
	"const users: User[] = [",
	'  { id: 1, name: "Ada", active: true },',
	'  { id: 2, name: "Linus", active: false },',
	"];",
	"",
	"export function getActiveNames(items: User[]): string[] {",
	"  return items.filter((user) => user.active).map((user) => user.name);",
	"}",
].join("\n");

const plainCode = [
	"Application configuration",
	"-------------------------",
	"host: localhost",
	"port: 3000",
	"streaming: enabled",
	"retries: 3",
].join("\n");

const streamingCode = [
	"async function loadMessages(chatId) {",
	`  const response = await fetch(\`/api/chats/\${chatId}\`);`,
	"",
	"  if (!response.ok) {",
	'    throw new Error("Unable to load messages");',
	"  }",
	"",
	"  return response.json();",
	"}",
].join("\n");

const completedUnclosedCode = [
	"const settings = {",
	'  model: "qwen3",',
	"  stream: true,",
	"  retries: 2,",
	"};",
	"",
	"console.log(settings);",
].join("\n");

const jsonCode = [
	"{",
	'  "ready": true,',
	'  "model": "qwen3",',
	'  "features": ["streaming", "thinking", "markdown"],',
	'  "limits": {',
	'    "context": 32768,',
	'    "retries": 3',
	"  }",
	"}",
].join("\n");

export const markdownParsingTestData: MarkdownParsingTestCase[] = [
	{
		name: "empty input",
		markdown: " \n\t\n",
		expected: [],
	},
	{
		name: "multiline paragraphs separated by blank lines",
		markdown: "First line\r\nsecond line\r\n\r\nNext paragraph.",
		expected: [
			{
				type: "paragraph",
				content: "First line\nsecond line",
			},
			{
				type: "paragraph",
				content: "Next paragraph.",
			},
		],
	},
	{
		name: "headings at supported depths",
		markdown: "# Primary\n### Tertiary\n###### Smallest",
		expected: [
			{ type: "heading", depth: 1, content: "Primary" },
			{ type: "heading", depth: 3, content: "Tertiary" },
			{ type: "heading", depth: 6, content: "Smallest" },
		],
	},
	{
		name: "heading-like text without valid syntax",
		markdown: "#No space\n####### Too deep",
		expected: [
			{
				type: "paragraph",
				content: "#No space\n####### Too deep",
			},
		],
	},
	{
		name: "unordered list with mixed markers",
		markdown: "- Alpha\n* Beta\n+ Gamma",
		expected: [
			{
				type: "list",
				ordered: false,
				items: ["Alpha", "Beta", "Gamma"],
			},
		],
	},
	{
		name: "ordered and unordered lists remain separate",
		markdown: "1. First\n2. Second\n- Third\n- Fourth",
		expected: [
			{
				type: "list",
				ordered: true,
				items: ["First", "Second"],
			},
			{
				type: "list",
				ordered: false,
				items: ["Third", "Fourth"],
			},
		],
	},
	{
		name: "multiline blockquote",
		markdown: "> Quoted line\n> second line\n>\n> final line",
		expected: [
			{
				type: "blockquote",
				content: ["Quoted line", "second line", "", "final line"],
			},
		],
	},
	{
		name: "closed fenced code with language",
		markdown: ["```ts", typescriptCode, "```"].join("\n"),
		expected: [
			{
				type: "code",
				language: "ts",
				code: typescriptCode,
				isOpen: false,
			},
		],
	},
	{
		name: "closed fenced code without language",
		markdown: ["```", plainCode, "```"].join("\n"),
		expected: [
			{
				type: "code",
				language: undefined,
				code: plainCode,
				isOpen: false,
			},
		],
	},
	{
		name: "unfinished fence while streaming",
		markdown: ["```js", streamingCode].join("\n"),
		isStreaming: true,
		expected: [
			{
				type: "code",
				language: "js",
				code: streamingCode,
				isOpen: true,
			},
		],
	},
	{
		name: "unfinished fence after streaming completes",
		markdown: ["```js", completedUnclosedCode].join("\n"),
		isStreaming: false,
		expected: [
			{
				type: "code",
				language: "js",
				code: completedUnclosedCode,
				isOpen: false,
			},
		],
	},
	{
		name: "table alignment and normalized rows",
		markdown: [
			"| Name | Score | Notes |",
			"| :--- | :---: | ---: |",
			"| Ada | 10 | Ready |",
			"| Linus | 9 |",
		].join("\n"),
		expected: [
			{
				type: "table",
				headers: ["Name", "Score", "Notes"],
				alignments: ["left", "center", "right"],
				rows: [
					["Ada", "10", "Ready"],
					["Linus", "9", ""],
				],
			},
		],
	},
	{
		name: "table with escaped pipes",
		markdown: ["Name \\| alias | Status", "--- | ---", "A \\| B | Active"].join(
			"\n",
		),
		expected: [
			{
				type: "table",
				headers: ["Name | alias", "Status"],
				alignments: [undefined, undefined],
				rows: [["A | B", "Active"]],
			},
		],
	},
	{
		name: "mixed document",
		markdown: [
			"## Summary",
			"",
			"A paragraph with **inline syntax**.",
			"",
			"- One",
			"- Two",
			"",
			"> A note",
			"",
			"```json",
			jsonCode,
			"```",
		].join("\n"),
		expected: [
			{ type: "heading", depth: 2, content: "Summary" },
			{
				type: "paragraph",
				content: "A paragraph with **inline syntax**.",
			},
			{ type: "list", ordered: false, items: ["One", "Two"] },
			{ type: "blockquote", content: ["A note"] },
			{
				type: "code",
				language: "json",
				code: jsonCode,
				isOpen: false,
			},
		],
	},
];
