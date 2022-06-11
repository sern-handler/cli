#!/usr/bin/env node

import { init } from './commands/init.js';
import { help } from './commands/help.js';

import { Command } from 'commander';
import { version } from './utilities/version.js';
export const program = new Command();

program
  .name('sern')
  .description(help())
  .version(version());

  program.command(init.name)
    .description("Quickest way to scaffold a new project")
    .option('-y', 'Finishes setup as default')
    .action(init)

program.parse()
