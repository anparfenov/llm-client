import { useMarkdownContent } from "@chat/widgets/MarkdownContent/hooks/useMarkdownContent";
import styles from "@chat/widgets/MarkdownContent/MarkdownContent.module.css";
import type { MarkdownContentProps } from "@chat/widgets/MarkdownContent/types";
import { For } from "solid-js";

export function MarkdownContent(props: MarkdownContentProps) {
	const markdown = useMarkdownContent(props);

	return (
		<div class={styles.markdown}>
			<For each={markdown.blocks()}>
				{(block, index) => markdown.renderBlock(block, index())}
			</For>
		</div>
	);
}
