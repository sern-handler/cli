import type { Choice, PromptObject } from 'prompts';
import { fetch } from 'undici';
import { getLang } from '../utilities/getLang.js';

function upperCase(string: string | null) {
	if (string === null) {
		console.error('Lang property not found!');
		process.exit(0);
	}
	return string === 'typescript' ? 'TypeScript' : 'JavaScript';
}

async function gimmechoices(): Promise<Choice[]> {
	const lang = upperCase(await getLang().catch(() => null));

	const link = `https://api.github.com/repos/sern-handler/awesome-plugins/contents/${lang}`;

	const resp = await fetch(link).catch(() => null);
	if (!resp)
		return [{ title: 'No plugins found!', value: '', disabled: true }];

	const data = (await resp.json()) as Data[];
	const choices = data.map((e) => ({
		title: e.name,
		value: e.download_url,
	}));
	return choices;
}

export async function pluginsQ(): Promise<PromptObject> {
	return {
		name: 'list',
		type: 'autocompleteMultiselect',
		message: 'What plugins do you want to install?',
		choices: await gimmechoices(),
		min: 1,
	};
}

interface Data {
	name: string;
	download_url: string;
}
