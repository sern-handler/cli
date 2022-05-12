import { blueBright } from 'colorette';

export const lang = {
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
			title: 'TypeScript',
			description: 'TS',
			value: 'typescript',
			selected: true,
		},
	],
};

export const default_prefix = {
	message:
		'What is the default prefix for your bot? Type "none" if it is completely Application-Command based',
	name: 'prefix',
	type: 'text',
	initial: '!',
};

export const main_dir = {
	message: 'What is the main directory of your project?',
	name: 'main_dir',
	type: 'text',
	initial: 'src',
};

export const cmds_dir = {
	message: 'What is the directory of your commands?',
	name: 'cmds_dir',
	type: 'text',
	initial: 'commands',
	validate: (dir) =>
		dir === 'src' ? 'You can not use src as a directory' : true,
};

/**
 * @type {import('prompts').PromptObject}
 */
export const npmInit = {
	name: 'npm_init',
	type: 'confirm',
	message: `Do you want ${blueBright('me')} to initialize npm?`,
	initial: true,
};

export const gitInit = {
	name: 'gitinit',
	type: 'confirm',
	message: `Do you want to ${blueBright('me')} to initialize git?`,
	initial: true,
};

export const which_manager = {
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

/**
 * @type {import('prompts').PromptObject}
 */
export const name = {
	message: 'What is your project name?',
	name: 'name',
	type: 'text',
	validate: (name) =>
		name.match('^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$')
			? true
			: 'Invalid name',
};
