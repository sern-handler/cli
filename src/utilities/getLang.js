import { findUp } from 'find-up';
import { readFile } from 'node:fs/promises';

export async function getLang() {
	const sernLocation = await findUp('sern.config.json');

	if (!sernLocation) throw new Error('Can\'t find sern.config.json');

	const output = JSON.parse(await readFile(sernLocation, 'utf8'));

	if (!output) throw new Error("Can't read your sern.config.json.");

	return output.language;
}
