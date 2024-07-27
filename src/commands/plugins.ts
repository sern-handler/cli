import { greenBright } from 'colorette';
import fs from 'fs';
import prompt from 'prompts';
import { fetch } from 'undici';
import { fromCwd } from '../utilities/fromCwd.js';
import esbuild from 'esbuild';
import { getConfig } from '../utilities/getConfig.js';
import type { PromptObject } from 'prompts';
import { resolve } from 'path';
import { require } from '../utilities/require.js';

interface PluginData {
    description: string;
    hash: string;
    name: string;
    author: string[];
    link: string;
    example: string;
    version: string;
}

const link = `https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/pluginlist.json`;
export async function fetchPluginData(): Promise<PluginData[]> {
    return fetch(link)
        .then(res => res.json())
        .then(data =>  (data as PluginData[])) 
        .catch(() => [])
}

export function pluginsQ(choices: PluginData[]): PromptObject[] {
    return [{
        name: 'list',
        type: 'autocompleteMultiselect',
        message: 'What plugins do you want to install?',
        choices: choices.map(e => ({ title: e.name, value: e })),
        min: 1,
    }];
}
/**
 * Installs plugins to project
 */
export async function plugins(args: string[], opts: Record<string, unknown>) {
    const plugins = await fetchPluginData();
    let selectedPlugins : PluginData[];
    if(args.length) {
        const normalizedArgs = args.map(str => str.toLowerCase())
        console.log("Trying to find plugins to install...");
        const results = plugins.reduce((acc, cur) => {
            if(normalizedArgs.includes(cur.name.toLowerCase())) {
                return [...acc, cur]
            }
            return acc;
        }, [] as PluginData[]);
        selectedPlugins = results;
    } else {
        selectedPlugins = (await prompt(pluginsQ(plugins))).list;
    }
    if (!selectedPlugins.length) {
        process.exit(1);
    }
    const { language } = await getConfig();
    for await (const plgData of selectedPlugins) {
        const pluginText = await download(plgData.link);
        const dir = fromCwd('/src/plugins');
        const linkNoExtension = `${process.cwd()}/src/plugins/${plgData.name}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (language === 'typescript') {
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

    const pluginNames = selectedPlugins.map((data) => {
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
