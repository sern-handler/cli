import { blueBright } from 'colorette';

// TODO refactor the intents stuff and add more questions
const Intents = [
	'DIRECT_MESSAGES',
	'DIRECT_MESSAGE_REACTIONS',
	'DIRECT_MESSAGE_TYPING',
	'GUILDS',
	'GUILD_BANS',
	'GUILD_EMOJIS_AND_STICKERS',
	'GUILD_INTEGRATIONS',
	'GUILD_INVITES',
	'GUILD_MEMBERS',
	'GUILD_MESSAGES',
	'GUILD_MESSAGE_REACTIONS',
	'GUILD_MESSAGE_TYPING',
	'GUILD_PRESENCES',
	'GUILD_SCHEDULED_EVENTS',
	'GUILD_VOICE_STATES',
	'GUILD_VOICE_STATES',
	'GUILD_WEBHOOKS',
].map((i, j) => ({ title: i, value: j, short: `${j}` })); //! bad way

export const lang = {
	message: 'What language you want the project to be in?',
	name: 'lang',
	type: 'select',
	choices: [
		{
			title: 'JavaScript',
			description: 'JS',
		},
		{
			title: 'TypeScript',
			description: 'TS',
		},
	],
};

export const intent = {
	message: 'What intents do you want to keep?',
	type: 'multiselect',
	name: 'intents',
	choices: Intents,
	min: 1,
	max: 16, //? 17 is max, i dont allow all
};

export const default_prefix = {
	message:
		'What is the default prefix for your bot? Type "none" if it is completely based on Application Commands',

	name: 'prefix',
	type: 'text',
	initial: '!',
};

export const token = {
	message: 'What is your bot token?',
	name: 'token',
	type: 'password',

	validate: (/** @type {string} */ token) =>
		token.match(
			/(?<mfaToken>mfa\.[a-z0-9_-]{20,})|(?<basicToken>[a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})/i
		)?.length
			? true
			: 'Invalid token',
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
	name: 'npminit',
	type: 'confirm',
	message: `Do you want to ${blueBright('me')} to initialize npm?`,
	initial: true,
};
/**
 * @type {import('prompts').PromptObject}
 */
export const gitInit = {
	name: 'gitinit',
	type: 'confirm',
	message: `Do you want to ${blueBright('me')} to initialize git?`,
	initial: true,
};
