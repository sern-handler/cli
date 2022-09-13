import { findUp } from 'find-up';
import { readFile } from 'node:fs/promises';

/**
 * It finds the sern.config.json file, reads it, and returns the language property
 * @returns The language of the project.
 */
export async function getLang(): Promise<'typescript' | 'javascript'> {
	const sernLocation = await findUp('sern.config.json');

	if (!sernLocation) throw new Error("Can't find sern.config.json");

	const output = JSON.parse(await readFile(sernLocation, 'utf8'));

	if (!output) throw new Error("Can't read your sern.config.json.");

	return output.language;
}
