import type { Block, TableAlignment } from "./types";

export function parseBlocks(markdown: string, isStreaming: boolean): Block[] {
	if (!markdown) {
		return [];
	}

	const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
	const blocks: Block[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];

		if (!line?.trim()) {
			index += 1;
			continue;
		}

		const fenceMatch = line.match(/^```\s*(\S*)?.*$/);

		if (fenceMatch) {
			const codeLines: string[] = [];
			index += 1;

			while (index < lines.length && !lines[index]?.startsWith("```")) {
				codeLines.push(lines[index] ?? "");
				index += 1;
			}

			const hasClosingFence = index < lines.length;

			blocks.push({
				type: "code",
				language: fenceMatch[1] || undefined,
				code: codeLines.join("\n"),
				isOpen: isStreaming && !hasClosingFence,
			});
			index += hasClosingFence ? 1 : 0;
			continue;
		}

		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

		if (headingMatch) {
			blocks.push({
				type: "heading",
				depth: headingMatch[1].length,
				content: headingMatch[2],
			});
			index += 1;
			continue;
		}

		const table = parseTable(lines, index);

		if (table) {
			blocks.push(table.block);
			index = table.nextIndex;
			continue;
		}

		if (isListLine(line)) {
			const ordered = isOrderedListLine(line);
			const items: string[] = [];

			while (
				index < lines.length &&
				isMatchingListLine(lines[index] ?? "", ordered)
			) {
				items.push(
					(lines[index] ?? "").replace(
						ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/,
						"",
					),
				);
				index += 1;
			}

			blocks.push({ type: "list", ordered, items });
			continue;
		}

		if (line.startsWith(">")) {
			const content: string[] = [];

			while (index < lines.length && lines[index]?.startsWith(">")) {
				content.push((lines[index] ?? "").replace(/^>\s?/, ""));
				index += 1;
			}

			blocks.push({ type: "blockquote", content });
			continue;
		}

		const paragraphLines: string[] = [];

		while (
			index < lines.length &&
			lines[index]?.trim() &&
			!startsBlock(lines[index] ?? "", lines[index + 1])
		) {
			paragraphLines.push(lines[index] ?? "");
			index += 1;
		}

		if (paragraphLines.length === 0) {
			paragraphLines.push(line);
			index += 1;
		}

		blocks.push({ type: "paragraph", content: paragraphLines.join("\n") });
	}

	return blocks;
}

function startsBlock(line: string, nextLine?: string): boolean {
	return (
		line.startsWith("```") ||
		/^(#{1,6})\s+/.test(line) ||
		isTableStart(line, nextLine) ||
		isListLine(line) ||
		line.startsWith(">")
	);
}

function isListLine(line: string): boolean {
	return isOrderedListLine(line) || /^\s*[-*+]\s+/.test(line);
}

function isOrderedListLine(line: string): boolean {
	return /^\s*\d+\.\s+/.test(line);
}

function isMatchingListLine(line: string, ordered: boolean): boolean {
	return ordered ? isOrderedListLine(line) : /^\s*[-*+]\s+/.test(line);
}

function parseTable(
	lines: string[],
	startIndex: number,
): { block: Extract<Block, { type: "table" }>; nextIndex: number } | null {
	const headerLine = lines[startIndex] ?? "";
	const delimiterLine = lines[startIndex + 1] ?? "";

	if (!isTableStart(headerLine, delimiterLine)) {
		return null;
	}

	const headers = splitTableRow(headerLine);
	const alignments = splitTableRow(delimiterLine).map(parseTableAlignment);
	const rows: string[][] = [];
	let index = startIndex + 2;

	while (index < lines.length && isTableRow(lines[index] ?? "")) {
		rows.push(
			normalizeTableCells(splitTableRow(lines[index] ?? ""), headers.length),
		);
		index += 1;
	}

	return {
		block: {
			type: "table",
			headers,
			alignments: normalizeTableAlignments(alignments, headers.length),
			rows,
		},
		nextIndex: index,
	};
}

function isTableStart(line: string, nextLine?: string): boolean {
	if (!nextLine || !isTableRow(line) || !isTableDelimiterRow(nextLine)) {
		return false;
	}

	return splitTableRow(line).length === splitTableRow(nextLine).length;
}

function isTableRow(line: string): boolean {
	return line.includes("|") && line.trim() !== "|";
}

function isTableDelimiterRow(line: string): boolean {
	const cells = splitTableRow(line);

	return (
		cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))
	);
}

function splitTableRow(line: string): string[] {
	const trimmedLine = line.trim().replace(/^\|/, "").replace(/\|$/, "");
	const cells: string[] = [];
	let cell = "";
	let isEscaped = false;

	for (const character of trimmedLine) {
		if (isEscaped) {
			cell += character;
			isEscaped = false;
			continue;
		}

		if (character === "\\") {
			isEscaped = true;
			continue;
		}

		if (character === "|") {
			cells.push(cell.trim());
			cell = "";
			continue;
		}

		cell += character;
	}

	cells.push(cell.trim());

	return cells;
}

function parseTableAlignment(cell: string): TableAlignment {
	const trimmedCell = cell.trim();
	const startsAligned = trimmedCell.startsWith(":");
	const endsAligned = trimmedCell.endsWith(":");

	if (startsAligned && endsAligned) {
		return "center";
	}

	if (endsAligned) {
		return "right";
	}

	return startsAligned ? "left" : undefined;
}

function normalizeTableAlignments(
	alignments: TableAlignment[],
	length: number,
): TableAlignment[] {
	return Array.from({ length }, (_, index) => alignments[index]);
}

function normalizeTableCells(cells: string[], length: number): string[] {
	return Array.from({ length }, (_, index) => cells[index] ?? "");
}
