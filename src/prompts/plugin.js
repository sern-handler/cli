import { fetch } from 'undici';
import { getLang } from '../utilities/getLang.js';

async function gimmechoices() {
	const lang = (await getLang().catch(() => null)).toUpperCase() ?? (() =>
		(console.error('Lang property not found!'), process.exit(0))
	)();
	const link = `https://api.github.com/repos/sern-handler/awesome-plugins/contents/${lang}`;

	const resp = await fetch(link).catch(() => null);

	if (!resp) return { title: 'No plugins found!', value: '', disabled: true };

	const data = await resp.json();
	return data.map(
		(/** @type {{ name: string; download_url: string; }} */ e) => ({
			title: e.name,
			value: e.download_url,
		})
	);
}

export async function pluginsQ() {
	return {
		name: 'list',
		type: 'autocompleteMultiselect',
		message: 'What plugins do you want to install?',
		choices: await gimmechoices(),
		min: 1,
	};
}
