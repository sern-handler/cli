import type { Choice, PromptObject } from 'prompts';
import { fetch } from 'undici';


async function gimmechoices(): Promise<Choice[]> {
    const link = `https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/pluginlist.json`;

    const resp = await fetch(link).catch(() => null);
    if (!resp) return [{ title: 'No plugins found!', value: '', disabled: true }];
    const data = (await resp.json()) as Data[];
    const choices = data.map((e) => ({
        title: e.name,
        value: e,
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
    link: string;
}
