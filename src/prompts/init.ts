import { blueBright } from 'colorette';
import type { PromptObject } from 'prompts';

export const lang: PromptObject = {
    message: 'What language do you want the project to be in?',
    name: 'lang',
    type: 'select',
    choices: [
        {
            title: 'JavaScript',
            description: 'JS',
            value: 'javascript',
        },
        {
            title: 'JavaScript (ESM)',
            description: 'JS',
            value: 'javascript-esm',
        },
        {
            title: 'TypeScript',
            description: 'TS - (Recommended)',
            value: 'typescript',
        },
    ],
};

export const main_dir: PromptObject = {
    message: 'What is the main directory of your project?',
    name: 'main_dir',
    type: 'text',
    initial: 'src',
};

export const cmds_dir: PromptObject = {
    message: 'What is the directory of your commands?',
    name: 'cmds_dir',
    type: 'text',
    initial: 'commands',
    validate: (dir: string) => (dir === 'src' ? 'You can not use src as a directory' : true),
};

export const npmInit: PromptObject = {
    name: 'npm_init',
    type: 'confirm',
    message: `Do you want ${blueBright('me')} to initialize npm?`,
    initial: true,
};

export const gitInit: PromptObject = {
    name: 'gitinit',
    type: 'confirm',
    message: `Do you want ${blueBright('me')} to initialize git?`,
    initial: true,
};

export const which_manager: PromptObject = {
    message: `Which manager do you want to use?`,
    name: 'manager',
    type: 'select',
    choices: [
        {
            title: 'NPM',
            description: 'Default Package Manager',
            selected: true,
            value: 'npm',
        },
        {
            title: 'Yarn',
            description: 'Yarn Package Manager',
            value: 'yarn',
        },
        {
            title: 'Skip',
            description: 'Skip selection',
            value: 'skip',
        },
    ],
};

export const skip_install_dep: PromptObject = {
    name: 'skip_install_dep',
    type: 'confirm',
    message: `Do you want ${blueBright('me')} to install dependencies?`,
    initial: false,
};

export const name: PromptObject = {
    message: 'What is your project name?',
    name: 'name',
    type: 'text',
    validate: (name: string) => (name.match('^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$') ? true : 'Invalid name'),
};
