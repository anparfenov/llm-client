import styles from "@chat/widgets/MarkdownContent/MarkdownContent.module.css";
import type {
	Block,
	InlineSegment,
	TableAlignment,
	UseMarkdownContentProps,
} from "@chat/widgets/MarkdownContent/types";
import { parseBlocks } from "@chat/widgets/MarkdownContent/utils/parseMarkdownBlocks";
import {
	tokenizeCode,
	type SyntaxTokenType,
} from "@chat/widgets/MarkdownContent/utils/tokenizeCode";
import { createMemo } from "solid-js";
import type { JSX } from "solid-js";

export function useMarkdownContent(props: UseMarkdownContentProps) {
	const blocks = createMemo(() =>
		parseBlocks(props.content, props.isStreaming ?? false),
	);

	return {
		blocks,
		renderBlock,
	};
}

function renderBlock(block: Block, index: number): JSX.Element {
	switch (block.type) {
		case "blockquote":
			return (
				<blockquote>
					<p>{renderInline(block.content.join("\n"))}</p>
				</blockquote>
			);
		case "code":
			return (
				<pre data-language={block.language} data-streaming={block.isOpen}>
					<code>{renderCode(block.code, block.language)}</code>
				</pre>
			);
		case "heading":
			return renderHeading(block.depth, block.content);
		case "list":
			return block.ordered ? (
				<ol>
					{block.items.map((item) => (
						<li>{renderInline(item)}</li>
					))}
				</ol>
			) : (
				<ul>
					{block.items.map((item) => (
						<li>{renderInline(item)}</li>
					))}
				</ul>
			);
		case "paragraph":
			return <p data-block-index={index}>{renderInline(block.content)}</p>;
		case "table":
			return renderTable(block);
	}
}

function renderCode(code: string, language?: string): JSX.Element[] {
	return tokenizeCode(code, language).map((token) => (
		<span class={getTokenClass(token.type)}>{token.content}</span>
	));
}

function getTokenClass(type: SyntaxTokenType): string | undefined {
	return type === "text"
		? undefined
		: styles[`token${type[0].toUpperCase()}${type.slice(1)}`];
}

function renderTable(block: Extract<Block, { type: "table" }>): JSX.Element {
	return (
		<div class={styles.tableScroller}>
			<table>
				<thead>
					<tr>
						{block.headers.map((header, index) => (
							<th class={getAlignmentClass(block.alignments[index])}>
								{renderInline(header)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{block.rows.map((row) => (
						<tr>
							{row.map((cell, index) => (
								<td class={getAlignmentClass(block.alignments[index])}>
									{renderInline(cell)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function getAlignmentClass(alignment: TableAlignment): string | undefined {
	switch (alignment) {
		case "center":
			return styles.alignCenter;
		case "left":
			return styles.alignLeft;
		case "right":
			return styles.alignRight;
		default:
			return undefined;
	}
}

function renderHeading(depth: number, content: string): JSX.Element {
	const children = renderInline(content);

	switch (depth) {
		case 1:
			return <h1>{children}</h1>;
		case 2:
			return <h2>{children}</h2>;
		case 3:
			return <h3>{children}</h3>;
		case 4:
			return <h4>{children}</h4>;
		case 5:
			return <h5>{children}</h5>;
		default:
			return <h6>{children}</h6>;
	}
}

function renderInline(content: string): Array<JSX.Element | string> {
	return tokenizeInline(content).map((segment) => {
		switch (segment.type) {
			case "bold":
				return <strong>{segment.content}</strong>;
			case "code":
				return <code>{segment.content}</code>;
			case "italic":
				return <em>{segment.content}</em>;
			case "link": {
				const href = getSafeHref(segment.href);

				return href ? (
					<a href={href} target="_blank" rel="noreferrer">
						{segment.content}
					</a>
				) : (
					segment.content
				);
			}
			case "text":
				return segment.content;
			default:
				return segment satisfies never;
		}
	});
}

function tokenizeInline(content: string): InlineSegment[] {
	const inlinePattern =
		/(`[^`\n]+`|\[[^\]\n]+\]\([^\s)]+(?:\s+"[^"]*")?\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_)/g;
	const segments: InlineSegment[] = [];
	let lastIndex = 0;
	let match = inlinePattern.exec(content);

	while (match) {
		if (match.index > lastIndex) {
			segments.push({
				type: "text",
				content: content.slice(lastIndex, match.index),
			});
		}

		segments.push(parseInlineToken(match[0]));
		lastIndex = inlinePattern.lastIndex;
		match = inlinePattern.exec(content);
	}

	if (lastIndex < content.length) {
		segments.push({ type: "text", content: content.slice(lastIndex) });
	}

	return segments;
}

function parseInlineToken(token: string): InlineSegment {
	if (token.startsWith("`")) {
		return { type: "code", content: token.slice(1, -1) };
	}

	if (token.startsWith("**") || token.startsWith("__")) {
		return { type: "bold", content: token.slice(2, -2) };
	}

	if (token.startsWith("*") || token.startsWith("_")) {
		return { type: "italic", content: token.slice(1, -1) };
	}

	const linkMatch = token.match(/^\[([^\]\n]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/);

	if (linkMatch) {
		return { type: "link", content: linkMatch[1], href: linkMatch[2] };
	}

	return { type: "text", content: token };
}

function getSafeHref(href: string): string | null {
	if (href.startsWith("/") || href.startsWith("#")) {
		return href;
	}

	try {
		const url = new URL(href);

		return ["http:", "https:", "mailto:"].includes(url.protocol) ? href : null;
	} catch {
		return null;
	}
}
