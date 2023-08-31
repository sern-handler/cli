import prompt from 'prompts';
import { extraPrompt } from '../prompts/extra.js';
import { create } from '../utilities/create.js';

export async function extra() {
    const extra = await prompt([extraPrompt]);

    if (Object.keys(extra).length < 1) process.exit(1);
    const lang = extra.extra.includes('typescript') ? 'TS' : 'JS';

    await create(extra.extra.split('-')[0], lang, process.cwd(), true);
}
