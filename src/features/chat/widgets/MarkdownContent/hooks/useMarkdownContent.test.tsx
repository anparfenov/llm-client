import { useMarkdownContent } from "@chat/widgets/MarkdownContent/hooks/useMarkdownContent";
import { createRoot, createSignal } from "solid-js";

describe("useMarkdownContent", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("reconciles blocks across appended streaming content", () => {
		vi.spyOn(console, "log").mockImplementation(() => undefined);

		createRoot((dispose) => {
			const [content, setContent] = createSignal("###");
			const [isStreaming, setIsStreaming] = createSignal(true);
			const markdown = useMarkdownContent({
				get content() {
					return content();
				},
				get isStreaming() {
					return isStreaming();
				},
			});

			expect(markdown.blocks()).toEqual([
				{ type: "paragraph", content: "###" },
			]);

			setContent("### Weekly\n\n- Monday");
			expect(markdown.blocks()).toEqual([
				{ type: "heading", depth: 3, content: "Weekly" },
				{ type: "list", ordered: false, items: ["Monday"] },
			]);

			setContent("### Weekly\n\n- Monday\n- Tuesday\n\n```ts\nconst x = 1");
			expect(markdown.blocks()).toEqual([
				{ type: "heading", depth: 3, content: "Weekly" },
				{
					type: "list",
					ordered: false,
					items: ["Monday", "Tuesday"],
				},
				{
					type: "code",
					language: "ts",
					code: "const x = 1",
					isOpen: true,
				},
			]);

			setContent(
				"### Weekly\n\n- Monday\n- Tuesday\n\n```ts\nconst x = 1;\n```\n\nDone",
			);
			setIsStreaming(false);
			expect(markdown.blocks()).toEqual([
				{ type: "heading", depth: 3, content: "Weekly" },
				{
					type: "list",
					ordered: false,
					items: ["Monday", "Tuesday"],
				},
				{
					type: "code",
					language: "ts",
					code: "const x = 1;",
					isOpen: false,
				},
				{ type: "paragraph", content: "Done" },
			]);

			dispose();
		});
	});

	it("resets incremental state when content is replaced", () => {
		vi.spyOn(console, "log").mockImplementation(() => undefined);

		createRoot((dispose) => {
			const [content, setContent] = createSignal("Original paragraph");
			const markdown = useMarkdownContent({
				get content() {
					return content();
				},
				isStreaming: true,
			});

			expect(markdown.blocks()).toEqual([
				{ type: "paragraph", content: "Original paragraph" },
			]);

			setContent("## Replacement");
			expect(markdown.blocks()).toEqual([
				{ type: "heading", depth: 2, content: "Replacement" },
			]);

			dispose();
		});
	});

	it("promotes an appended table delimiter into a table block", () => {
		vi.spyOn(console, "log").mockImplementation(() => undefined);

		createRoot((dispose) => {
			const [content, setContent] = createSignal("| Name | Score |");
			const markdown = useMarkdownContent({
				get content() {
					return content();
				},
				isStreaming: true,
			});

			expect(markdown.blocks()).toEqual([
				{ type: "paragraph", content: "| Name | Score |" },
			]);

			setContent("| Name | Score |\n| --- | ---: |\n| Ada | 10 |");
			expect(markdown.blocks()).toEqual([
				{
					type: "table",
					headers: ["Name", "Score"],
					alignments: [undefined, "right"],
					rows: [["Ada", "10"]],
				},
			]);

			dispose();
		});
	});
});
