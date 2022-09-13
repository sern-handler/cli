import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export function version() {
	const { version: v } = require('../../package.json');
	return `SernHandler CLI v${v}`;
}
