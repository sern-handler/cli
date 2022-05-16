import prompts from 'prompts';
import { extraPrompt } from '../prompts/extra.js';
const { prompt } = prompts;

export async function extra() {
	const extra = await prompt([extraPrompt]);

	if (Object.keys(extra).length < 1) process.exit(1);
}
