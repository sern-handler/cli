#!/usr/bin/env node

import { init } from './commands/init.js';

const regex = /(?<=--|-)\w+/gm;
const flags = process.argv.slice(2).join(' ').match(regex);
// TODO codegolf it maybe? @HighArcs @jacoobes
const args = process.argv
	.slice(2)
	.join(' ')
	.trim()
	.split(/ +/)
	.filter((e) => !/(--|-)\w+/gm.test(e));
const cmdName = args[0];
const commands = new Map([['init', init]]);
const found = commands.get(cmdName);
if (found) {
	await found({ args, flags });
} else console.log('Unknown Command // in future help maybe??');
