import { parseBlocks } from "../parseMarkdownBlocks";
import { markdownParsingTestData } from "./fixtures/markdownParsingTestData";

describe("parseBlocks", () => {
	it.each(markdownParsingTestData)("$name", (testCase) => {
		const result = parseBlocks(
			testCase.markdown,
			testCase.isStreaming ?? false,
		);

		expect(result).toEqual(testCase.expected);
	});

	it("updates an open code block as markdown streams", () => {
		const stages = [
			{ markdown: "```ts", code: "", isOpen: true },
			{
				markdown: "```ts\nconst answer = 42;",
				code: "const answer = 42;",
				isOpen: true,
			},
			{
				markdown: "```ts\nconst answer = 42;\n```",
				code: "const answer = 42;",
				isOpen: false,
			},
		];

		for (const stage of stages) {
			expect(parseBlocks(stage.markdown, true)).toEqual([
				{
					type: "code",
					language: "ts",
					code: stage.code,
					isOpen: stage.isOpen,
				},
			]);
		}
	});
});
