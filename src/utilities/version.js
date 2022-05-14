import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version: v } = require('../../package.json');

export function version() {
	console.log(`SernHandler CLI v${v}`);
}
