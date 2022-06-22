import axios from 'axios';
import { getLang } from '../utilities/getLang.js';
async function gimmechoices() {
	const lang =
		(await getLang()) === 'typescript' ? 'TypeScript' : 'JavaScript';
	const link = `https://api.github.com/repos/sern-handler/awesome-plugins/contents/${lang}`;

	const resp = await axios.default.get(link).catch(() => null);
	if (!resp) return { title: 'No plugins found!', value: '', disabled: true };
	const { data } = resp;
	const choices = data.map(
		(/** @type {{ name: string; download_url: string; }} */ e) => ({
			title: e.name,
			value: e.download_url,
		})
	);
	return choices;
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
