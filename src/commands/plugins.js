import { pluginsQ } from '../prompts/plugin.js';
import prompts from 'prompts';
import axios from 'axios';
import fs from 'fs';
import { greenBright } from 'colorette';
const { prompt } = prompts;
/**
 * Installs plugins to project
 * @param flags
 */
export async function plugins(flags) {
	/**
	 * @type {string[]}
	 */
	const e = (await prompt([pluginsQ])).list;

	for await (const url of e) {
		await download(url);
	}
	const pluginNames = e.map((e) => e.split('/').pop());
	console.log(
		`Successfully downloaded plugin(s):\n${greenBright(
			pluginNames.join('\n')
		)}`
	);
}

async function download(url) {
	const res = await axios.get(url);
	const data = res.data;
	const dir = `${process.cwd()}\\src\\plugins`;
	const filedir = `${process.cwd()}\\src\\plugins\\${url.split('/').pop()}`;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const file = fs.writeFileSync(filedir, data);

	return file;
}
