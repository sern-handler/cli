import { greenBright } from 'colorette';
import fs from 'fs';
import prompt from 'prompts';
import { fetch } from 'undici';
import { pluginsQ } from '../prompts/plugin.js';
import { fromCwd } from '../utilities/fromCwd.js';
import esbuild from 'esbuild';
import { getLang } from '../utilities/getLang.js';
import { resolve } from 'path';
import { require } from '../utilities/require.js';
import { getConfig } from  '../utilities/getConfig.js';
interface PluginData {
    description: string;
    hash: string;
    name: string;
    author: string[];
    link: string;
    example: string;
    version: '1.0.0';
}

/**
 * Installs plugins to project
 */
export async function plugins() {
    const e: PluginData[] = (await prompt([await pluginsQ()])).list;
    if (!e) process.exit(1);

    const lang = await getLang();
    const config = await getConfig();
    for await (const plgData of e) {
        const pluginText = await download(plgData.link);
        const dir = fromCwd(`src/${config.paths.plugins ?? 'plugins'}`);
        const linkNoExtension = `${dir}/${plgData.name}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (lang === 'typescript') {
            fs.writeFileSync(linkNoExtension + '.ts', pluginText);
        } else {
            const { type = undefined } = require(resolve('package.json'));
            const format = type === undefined || type === 'cjs' ? 'cjs' : 'esm';
            const transformResult = await esbuild.transform(pluginText, {
                target: 'node18',
                format,
                loader: 'ts',
                banner: `/**\n    Partial information: ${plgData.description}\n    @author ${plgData.author}\n    @example${plgData.example}*/`,
            });
            if (transformResult.warnings.length > 0) {
                console.log(transformResult.warnings.map((msg) => msg.text).join('\n'));
            }
            console.warn('transforming plugins with js strips comments');
            console.warn('We provided some minimal information at top of file, or view the documentation for this plugin here:');
            console.warn(plgData.link);
            fs.writeFileSync(linkNoExtension + '.js', transformResult.code);
        }
    }

    const pluginNames = e.map((data) => {
        return 'Installed ' + data.name + ' ' + 'from ' + data.author.join(',');
    });
    console.log(`Successfully downloaded plugin(s):\n${greenBright(pluginNames.join('\n'))}`);
}

async function download(url: string) {
    const data = await fetch(url, { method: 'GET' })
        .then((res) => res.text())
        .catch(() => null);

    if (!data) throw new Error('Download failed! Kindly contact developers');

    return data;
}
