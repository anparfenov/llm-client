import { useMarkdownContent } from "@chat/widgets/MarkdownContent/hooks/useMarkdownContent";
import styles from "@chat/widgets/MarkdownContent/MarkdownContent.module.css";

type MarkdownContentProps = {
	content: string;
};

export function MarkdownContent(props: MarkdownContentProps) {
	const markdown = useMarkdownContent(props);

	return (
		<div class={styles.markdown}>
			{markdown.blocks().map(markdown.renderBlock)}
		</div>
	);
}
