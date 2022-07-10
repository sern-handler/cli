import { pluginsQ } from '../prompts/plugin.js';
import prompts from 'prompts';
import { fetch } from 'undici';
import fs from 'fs';
import { greenBright } from 'colorette';
const { prompt } = prompts;

/**
 * Installs plugins to project
 */
export async function plugins() {
	/**
	 * @type {string[]}
	 */
	const e = (await prompt([await pluginsQ()])).list;
	if (!e) process.exit(1);

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

/**
 * @param {string} url
 * @returns File
 */
async function download(url) {
	const data = await fetch(url, { method: 'GET' })
		.then((res) => res.text())
		.catch(() => null);

	if (!data) throw new Error('Download failed! Kindly contact developers');

	const dir = `${process.cwd()}/src/plugins`;
	const filedir = `${process.cwd()}/src/plugins/${url.split('/').pop()}`;

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const file = fs.writeFileSync(filedir, data);
	return file;
}
