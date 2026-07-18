import type { SyntaxToken } from "./types";

const commonKeywords = new Set([
	"as",
	"async",
	"await",
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"default",
	"delete",
	"do",
	"else",
	"export",
	"extends",
	"finally",
	"for",
	"from",
	"function",
	"if",
	"import",
	"in",
	"instanceof",
	"interface",
	"let",
	"new",
	"of",
	"return",
	"static",
	"switch",
	"throw",
	"try",
	"type",
	"typeof",
	"var",
	"void",
	"while",
	"with",
	"yield",
]);

const pythonKeywords = new Set([
	"and",
	"as",
	"assert",
	"async",
	"await",
	"break",
	"class",
	"continue",
	"def",
	"del",
	"elif",
	"else",
	"except",
	"finally",
	"for",
	"from",
	"global",
	"if",
	"import",
	"in",
	"is",
	"lambda",
	"nonlocal",
	"not",
	"or",
	"pass",
	"raise",
	"return",
	"try",
	"while",
	"with",
	"yield",
]);

const sqlKeywords = new Set([
	"and",
	"as",
	"asc",
	"by",
	"create",
	"delete",
	"desc",
	"distinct",
	"drop",
	"from",
	"group",
	"having",
	"insert",
	"into",
	"join",
	"left",
	"limit",
	"not",
	"null",
	"on",
	"or",
	"order",
	"outer",
	"right",
	"select",
	"set",
	"table",
	"union",
	"update",
	"values",
	"where",
]);

const literals = new Set([
	"false",
	"null",
	"true",
	"undefined",
	"False",
	"None",
	"True",
]);

const languageAliases: Record<string, string> = {
	bash: "shell",
	css: "style",
	html: "markup",
	javascript: "script",
	js: "script",
	jsx: "script",
	py: "python",
	sh: "shell",
	tsx: "script",
	typescript: "script",
	ts: "script",
	xhtml: "markup",
	xml: "markup",
	zsh: "shell",
};

export function tokenizeCode(code: string, language?: string): SyntaxToken[] {
	const normalizedLanguage = normalizeLanguage(language);
	const keywords = getKeywords(normalizedLanguage);
	const tokens: SyntaxToken[] = [];
	let remaining = code;

	while (remaining) {
		const token = matchToken(remaining, normalizedLanguage, keywords);

		pushToken(tokens, token);
		remaining = remaining.slice(token.content.length);
	}

	return tokens;
}

function matchToken(
	code: string,
	language: string,
	keywords: Set<string>,
): SyntaxToken {
	const comment = matchComment(code, language);

	if (comment) {
		return { type: "comment", content: comment };
	}

	if (language === "markup") {
		const tag = code.match(/^<\/?[A-Za-z][\w:-]*/)?.[0];

		if (tag) {
			return { type: "tag", content: tag };
		}
	}

	const string = code.match(
		/^(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`)/,
	)?.[0];

	if (string) {
		return { type: "string", content: string };
	}

	const number = code.match(
		/^\b(?:0[xob][\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/i,
	)?.[0];

	if (number) {
		return { type: "number", content: number };
	}

	const identifier = code.match(/^[A-Za-z_$][\w$-]*/)?.[0];

	if (identifier) {
		if (literals.has(identifier)) {
			return { type: "literal", content: identifier };
		}

		if (keywords.has(identifier.toLowerCase())) {
			return { type: "keyword", content: identifier };
		}

		const following = code.slice(identifier.length);

		if (/^\s*\(/.test(following)) {
			return { type: "function", content: identifier };
		}

		if (
			(language === "json" || language === "style") &&
			/^\s*:/.test(following)
		) {
			return { type: "property", content: identifier };
		}

		return { type: "text", content: identifier };
	}

	const operator = code.match(
		/^(?:=>|===?|!==?|\?\?|\?\.|&&|\|\||\+\+|--|\*\*|[+\-*/%=&|!<>~?:])/,
	)?.[0];

	if (operator) {
		return { type: "operator", content: operator };
	}

	const punctuation = code.match(/^[{}[\](),.;]/)?.[0];

	return punctuation
		? { type: "punctuation", content: punctuation }
		: { type: "text", content: code[0] };
}

function matchComment(code: string, language: string): string | undefined {
	if (language === "markup") {
		return code.match(/^<!--[\s\S]*?(?:-->|$)/)?.[0];
	}

	if (language === "python" || language === "shell") {
		return code.match(/^#[^\n]*/)?.[0];
	}

	if (language === "sql") {
		return code.match(/^(?:--[^\n]*|\/\*[\s\S]*?(?:\*\/|$))/)?.[0];
	}

	return code.match(/^(?:\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))/)?.[0];
}

function normalizeLanguage(language?: string): string {
	const normalized = language?.toLowerCase() ?? "";

	return languageAliases[normalized] ?? normalized;
}

function getKeywords(language: string): Set<string> {
	if (language === "python") {
		return pythonKeywords;
	}

	if (language === "sql") {
		return sqlKeywords;
	}

	return commonKeywords;
}

function pushToken(tokens: SyntaxToken[], token: SyntaxToken): void {
	const previous = tokens.at(-1);

	if (previous?.type === token.type) {
		previous.content += token.content;
		return;
	}

	tokens.push(token);
}
