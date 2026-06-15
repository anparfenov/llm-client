import type { JSX } from 'solid-js';

import styles from '@chat/components/MarkdownContent/MarkdownContent.module.css';

type MarkdownContentProps = {
  content: string;
};

type Block =
  | { type: 'blockquote'; content: string[] }
  | { type: 'code'; code: string; language?: string }
  | { type: 'heading'; depth: number; content: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'paragraph'; content: string }
  | { type: 'table'; alignments: TableAlignment[]; headers: string[]; rows: string[][] };

type TableAlignment = 'center' | 'left' | 'right' | undefined;

type InlineSegment =
  | { type: 'bold'; content: string }
  | { type: 'code'; content: string }
  | { type: 'italic'; content: string }
  | { type: 'link'; content: string; href: string }
  | { type: 'text'; content: string };

export function MarkdownContent(props: MarkdownContentProps) {
  const blocks = () => parseBlocks(props.content);

  return <div class={styles.markdown}>{blocks().map(renderBlock)}</div>;
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line?.trim()) {
      index += 1;
      continue;
    }

    const fenceMatch = line.match(/^```(\S*)\s*$/);

    if (fenceMatch) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index]?.startsWith('```')) {
        codeLines.push(lines[index] ?? '');
        index += 1;
      }

      blocks.push({
        type: 'code',
        language: fenceMatch[1] || undefined,
        code: codeLines.join('\n'),
      });
      index += index < lines.length ? 1 : 0;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      blocks.push({
        type: 'heading',
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

      while (index < lines.length && isMatchingListLine(lines[index] ?? '', ordered)) {
        items.push((lines[index] ?? '').replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/, ''));
        index += 1;
      }

      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    if (line.startsWith('>')) {
      const content: string[] = [];

      while (index < lines.length && lines[index]?.startsWith('>')) {
        content.push((lines[index] ?? '').replace(/^>\s?/, ''));
        index += 1;
      }

      blocks.push({ type: 'blockquote', content });
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index]?.trim() &&
      !startsBlock(lines[index] ?? '', lines[index + 1])
    ) {
      paragraphLines.push(lines[index] ?? '');
      index += 1;
    }

    blocks.push({ type: 'paragraph', content: paragraphLines.join('\n') });
  }

  return blocks;
}

function startsBlock(line: string, nextLine?: string): boolean {
  return (
    line.startsWith('```') ||
    /^(#{1,6})\s+/.test(line) ||
    isTableStart(line, nextLine) ||
    isListLine(line) ||
    line.startsWith('>')
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
): { block: Extract<Block, { type: 'table' }>; nextIndex: number } | null {
  const headerLine = lines[startIndex] ?? '';
  const delimiterLine = lines[startIndex + 1] ?? '';

  if (!isTableStart(headerLine, delimiterLine)) {
    return null;
  }

  const headers = splitTableRow(headerLine);
  const alignments = splitTableRow(delimiterLine).map(parseTableAlignment);
  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length && isTableRow(lines[index] ?? '')) {
    rows.push(normalizeTableCells(splitTableRow(lines[index] ?? ''), headers.length));
    index += 1;
  }

  return {
    block: {
      type: 'table',
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
  return line.includes('|') && line.trim() !== '|';
}

function isTableDelimiterRow(line: string): boolean {
  const cells = splitTableRow(line);

  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitTableRow(line: string): string[] {
  const trimmedLine = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let cell = '';
  let isEscaped = false;

  for (const character of trimmedLine) {
    if (isEscaped) {
      cell += character;
      isEscaped = false;
      continue;
    }

    if (character === '\\') {
      isEscaped = true;
      continue;
    }

    if (character === '|') {
      cells.push(cell.trim());
      cell = '';
      continue;
    }

    cell += character;
  }

  cells.push(cell.trim());

  return cells;
}

function parseTableAlignment(cell: string): TableAlignment {
  const trimmedCell = cell.trim();
  const startsAligned = trimmedCell.startsWith(':');
  const endsAligned = trimmedCell.endsWith(':');

  if (startsAligned && endsAligned) {
    return 'center';
  }

  if (endsAligned) {
    return 'right';
  }

  return startsAligned ? 'left' : undefined;
}

function normalizeTableAlignments(
  alignments: TableAlignment[],
  length: number,
): TableAlignment[] {
  return Array.from({ length }, (_, index) => alignments[index]);
}

function normalizeTableCells(cells: string[], length: number): string[] {
  return Array.from({ length }, (_, index) => cells[index] ?? '');
}

function renderBlock(block: Block, index: number): JSX.Element {
  switch (block.type) {
    case 'blockquote':
      return (
        <blockquote>
          <p>{renderInline(block.content.join('\n'))}</p>
        </blockquote>
      );
    case 'code':
      return (
        <pre data-language={block.language}>
          <code>{block.code}</code>
        </pre>
      );
    case 'heading':
      return renderHeading(block.depth, block.content);
    case 'list':
      return block.ordered ? (
        <ol>{block.items.map((item) => <li>{renderInline(item)}</li>)}</ol>
      ) : (
        <ul>{block.items.map((item) => <li>{renderInline(item)}</li>)}</ul>
      );
    case 'paragraph':
      return <p data-block-index={index}>{renderInline(block.content)}</p>;
    case 'table':
      return renderTable(block);
  }
}

function renderTable(block: Extract<Block, { type: 'table' }>): JSX.Element {
  return (
    <div class={styles.tableScroller}>
      <table>
        <thead>
          <tr>
            {block.headers.map((header, index) => (
              <th class={getAlignmentClass(block.alignments[index])}>{renderInline(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr>
              {row.map((cell, index) => (
                <td class={getAlignmentClass(block.alignments[index])}>{renderInline(cell)}</td>
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
    case 'center':
      return styles.alignCenter;
    case 'left':
      return styles.alignLeft;
    case 'right':
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
      case 'bold':
        return <strong>{segment.content}</strong>;
      case 'code':
        return <code>{segment.content}</code>;
      case 'italic':
        return <em>{segment.content}</em>;
      case 'link': {
        const href = getSafeHref(segment.href);

        return href ? (
          <a href={href} target="_blank" rel="noreferrer">
            {segment.content}
          </a>
        ) : (
          segment.content
        );
      }
      case 'text':
        return segment.content;
    }
  });
}

function tokenizeInline(content: string): InlineSegment[] {
  const inlinePattern =
    /(`[^`\n]+`|\[[^\]\n]+\]\([^\s)]+(?:\s+"[^"]*")?\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_)/g;
  const segments: InlineSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(content))) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }

    segments.push(parseInlineToken(match[0]));
    lastIndex = inlinePattern.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return segments;
}

function parseInlineToken(token: string): InlineSegment {
  if (token.startsWith('`')) {
    return { type: 'code', content: token.slice(1, -1) };
  }

  if (token.startsWith('**') || token.startsWith('__')) {
    return { type: 'bold', content: token.slice(2, -2) };
  }

  if (token.startsWith('*') || token.startsWith('_')) {
    return { type: 'italic', content: token.slice(1, -1) };
  }

  const linkMatch = token.match(/^\[([^\]\n]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/);

  if (linkMatch) {
    return { type: 'link', content: linkMatch[1], href: linkMatch[2] };
  }

  return { type: 'text', content: token };
}

function getSafeHref(href: string): string | null {
  if (href.startsWith('/') || href.startsWith('#')) {
    return href;
  }

  try {
    const url = new URL(href);

    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? href : null;
  } catch {
    return null;
  }
}
