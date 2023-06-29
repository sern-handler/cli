import { readFile } from 'node:fs/promises';
import { findUp } from 'find-up';

export async function getConfig(): Promise<sernConfig> {
	const sernLocation = await findUp('sern.config.json');

	if (!sernLocation) throw new Error("Can't find sern.config.json");

	const output = JSON.parse(await readFile(sernLocation, 'utf8')) as sernConfig;

	if (!output) throw new Error("Can't read your sern.config.json.");

	return output;
}

interface sernConfig {
	language: 'typescript' | 'javascript';
	paths: {
		base: string;
		cmds_dir: string;
	};
}
