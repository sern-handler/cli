import { greenBright } from 'colorette';
import fs from 'fs';
import prompt from 'prompts';
import { fetch } from 'undici';
import { pluginsQ } from '../prompts/plugin.js';
import { fromCwd } from '../utilities/fromCwd.js';

/**
 * Installs plugins to project
 */
export async function plugins() {
    const e: string[] = (await prompt([await pluginsQ()])).list;
    if (!e) process.exit(1);

    for await (const url of e) {
        await download(url);
    }
    const pluginNames = e.map((e) => e.split('/').pop());
    console.log(`Successfully downloaded plugin(s):\n${greenBright(pluginNames.join('\n'))}`);
}

async function download(url: string) {
    const data = await fetch(url, { method: 'GET' })
        .then((res) => res.text())
        .catch(() => null);

    if (!data) throw new Error('Download failed! Kindly contact developers');

    const dir = `${fromCwd('/src/plugins')}`;
    const filedir = `${process.cwd()}/src/plugins/${url.split('/').pop()}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filedir, data);
}
