#!/usr/bin/env node

import { init } from './commands/init.js';
import { help } from './commands/help.js';
import { extra } from './commands/extra.js';

import { Command } from 'commander';
import { version } from './utilities/version.js';
import { plugins } from './commands/plugins.js';
export const program = new Command();

program
	.name('sern')
	.description(help())
	.version(version())
	.exitOverride(() => process.exit(0));

program
	.command(init.name)
	.description('Quickest way to scaffold a new project')
	.option('-y', 'Finishes setup as default')
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

program.parse();
