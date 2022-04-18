import { findUp } from 'find-up';
import pkg from 'inquirer';
const { prompt } = pkg;
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
].map((i, j) => ({ name: i, value: j, short: `${j}` }));

export async function init({ flags }) {
	if (flags?.includes('y')) {
		console.log("I see a flag there! Seems like you're lazy!\nBye!");
		process.exit(0);
	}
	const pkg = await findUp('package.json');
	if (!pkg) {
		console.log('No package.json found');
		return process.exit(1);
	}
	await whichLang();
	const input = await kindPrefix();
	if (input.prefix !== 'app_cmds') {
		await legacy();
	}
	await intents();
}
const lang = {
	message: 'What language you want the project to be in?',
	name: 'lang',
	type: 'list',
	choices: [
		{
			name: 'JavaScript',
			value: 'js',
			type: 'choice',
		},
		{
			name: 'TypeScript',
			value: 'ts',
			type: 'choice',
		},
	],
};

const intent = {
	message: 'What intents do you want to keep?',
	type: 'checkbox',
	name: 'intents',
	choices: Intents,
	validate(a) {
		if (a.length < 1) {
			return 'You must choose at least one intent!';
		}
		if (a.length === 17) {
			return 'You do NOT need all intents!';
		}
		return true;
	},
	default: [3, 9],
};

const legacy_prefix = {
	message: 'What is the legacy prefix for your bot?',
	name: 'prefix',
	type: 'input',
	default: '!',
	validate(a) {
		if (a.length < 1) {
			return 'You must choose a prefix!';
		}
		return true;
	},
};

const kind_prefix = {
	message:
		'What kind of prefix your bot will use? Select "Both" for both prefixes.',
	name: 'prefix',
	type: 'list',
	choices: [
		{
			name: 'Prefix [Message Based]',
			value: 'legacy',
		},
		{
			name: 'Interactions [Slash Commands, Context Menu Commands]',
			value: 'app_cmds',
		},
		{
			name: 'Both',
			value: 'both',
			type: 'choice',
		},
	],
};

async function whichLang() {
	const a = await prompt([lang]);
	return a;
}

async function kindPrefix() {
	const a = await prompt([kind_prefix]);
	return a;
}

async function legacy() {
	const a = await prompt([legacy_prefix]);
	return a;
}

async function intents() {
	const a = await prompt([intent]);
	return a;
}
