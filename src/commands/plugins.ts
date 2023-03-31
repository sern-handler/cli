import { greenBright } from 'colorette';
import fs from 'fs';
import prompt from 'prompts';
import { fetch, type Response } from 'undici';
import { pluginsQ } from '../prompts/plugin.js';
import { fromCwd } from '../utilities/fromCwd.js';

/**
 * Installs plugins to project
 */

function dispatchSave() {

}

function dispatchInstall() {
    
}

export async function plugins(options: PluginOptions) {
    console.log(options)
    if(options.save) {
        dispatchSave()
    }
    //Download instead based on names given. Must be a full filename ie: (publish.ts)
    if(options.name) {
         

    }
    const e: string[] = (await prompt([await pluginsQ()])).list;
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

async function downloa(url: string, path: string) {
    const format = (res: Response) => res.text()
    const data = await fetch(url, { method: 'GET' })
        .then(format)
        .catch(() => {
            throw Error('Download failed! Kindly contact developers')
        })
    
    const fullPath = fromCwd(path)
    
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

interface PluginOptions {
    name?: string[];
    save: boolean 

}
