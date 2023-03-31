import { requiree } from "..";

export function version() {
	const { version: v } = requiree('../../package.json');
	return `@sern/cli v${v}`;
}
