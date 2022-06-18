import axios from 'axios';
import { getLang } from '../utilities/getLang.js';
async function gimmechoices() {
	const lang =
		(await getLang()) === 'typescript' ? 'TypeScript' : 'JavaScript';
	const link = `https://api.github.com/repos/sern-handler/awesome-plugins/contents/${lang}`;

	const data = (await axios.get(link)).data;
	const choices = data.map((e) => ({
		title: e.name,
		value: e.download_url,
	}));
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
