#!/usr/bin/env node

import { extra } from './commands/extra.js';
import { help } from './commands/help.js';
import { init } from './commands/init.js';
import { publish } from './commands/publish.js';

import { Command } from 'commander';
import { plugins } from './commands/plugins.js';
import { yellowBright } from 'colorette';
export const program = new Command();

const version: string = '[VI]{{inject}}[/VI]';
program
	.name('sern')
	.description(help())
	.version(`sern CLI v${version}`, '-v, --version')
	.exitOverride(() => process.exit(0));

program
	.command(init.name)
	.description(
		`Quickest way to scaffold a new project ${yellowBright('[DEPRECATED]')}`
	)
	.option('-y', 'Finishes setup as default')
	.option('-s, --sync', 'Syncs the project and generates sern.config.json')
	.action(init);

program
	.command(plugins.name)
	.description(
		'Install plugins from https://github.com/sern-handler/awesome-plugins'
	)
	.option('-n --name', 'Name of plugin')
	.action(plugins);

program
	.command(extra.name)
	.description('Easy way to add extra things in your sern project')
	.action(extra);

program
	.command(publish.name)
	.description('New way to manage your slash commands')
	.argument('<name>', 'name of the file without extension')
	.action(publish);

program.parse();
