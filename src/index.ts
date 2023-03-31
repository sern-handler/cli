#!/usr/bin/env node

import { extra } from './commands/extra.js';
import { help } from './commands/help.js';
import { init } from './commands/init.js';

import { Command } from 'commander';
import { plugins } from './commands/plugins.js';
export const program = new Command();

<<<<<<< Updated upstream
const version: string = '[VI]{{inject}}[/VI]';
=======
import { createRequire } from 'module';
export const requiree = createRequire(import.meta.url);

>>>>>>> Stashed changes
program
	.name('sern')
	.description(help())
	.version(`sern CLI v${version}`)
	.exitOverride(() => process.exit(0));

program
	.command(init.name)
	.description('Quickest way to scaffold a new project')
	.option('-y', 'Finishes setup as default')
	.option('-s, --sync', 'Syncs the project and generates sern.config.json')
	.action(init);

const pluginCommand = program.command(plugins.name)
pluginCommand
    .description(
	'Get plugins from https://github.com/sern-handler/awesome-plugins'
    )
    .option('-n --name <string...>', 'Name(s) of plugin to install')
    .option('-S --save', 'Save and keep plugins updated')
    .action(plugins);
    
program
	.command(extra.name)
	.description('Easy way to add extra things in your sern project')
	.action(extra);

program.parse();
