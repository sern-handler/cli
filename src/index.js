#!/usr/bin/env node

import { init } from './commands/init.js';
import { help } from './commands/help.js';
import { extra } from './commands/extra.js';

// import { Command } from 'commander';
// const program = new Command()
// program
// 	.name("sern")
// 	.version()
// 	.option('--first')
// 	.option('-s, --separator <char>');
const regex = /(?<=--|-)\w+/gm;
const rawArgs = process.argv.slice(2);
const flags = rawArgs.join(' ').match(regex);

const args = rawArgs
	.join(' ')
	.trim()
	.split(/ +/)
	.filter((e) => !/(--|-)\w+/gm.test(e));

const cmdName = args[0] || '';

const commands = new Map([
	['help', help],
	['', help],
	['init', init],
	['extra', extra],
]);

const found = commands.get(cmdName);

if (found) {
	await found({ args, flags });
} else console.log('Unknown Command');
