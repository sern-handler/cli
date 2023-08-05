#!/usr/bin/env node

import { Command } from 'commander';
import { yellowBright } from 'colorette';
export const program = new Command();

const importDynamic = async <T extends string>(filename: T) => import(`./commands/${filename}` as const)
const version: string = '[VI]{{inject}}[/VI]';
program
    .name('sern')
    .description(await importDynamic('help.js').then(m => m.help))
    .version(`sern CLI v${version}`, '-v, --version')
    .exitOverride(() => process.exit(0));

program
    .command('init')
    .description(
        `Quickest way to scaffold a new project ${yellowBright('[DEPRECATED]')}`
    )
    .option('-y', 'Finishes setup as default')
    .option('-s, --sync', 'Syncs the project and generates sern.config.json')
    .action(async (...args) => importDynamic('init.js').then(m => m.init(...args)));

program
    .command('plugins')
    .description(
        'Install plugins from https://github.com/sern-handler/awesome-plugins'
    )
    .option('-n --name', 'Name of plugin')
    .action((...args) => importDynamic('plugins.js').then(m => m.plugins(...args)));

program
    .command('extra')
    .description('Easy way to add extra things in your sern project')
    .action((...args) => importDynamic('extra').then(m => m.extra(...args)));

program
    .command('publish')
    .description('Manage your slash commands')
    .option('-a, --all', 'Publish all commands')
    .option('-t, --token [token]')
    .option('--appId [applicationId]')
    .argument(
        '[pattern]',
        'glob pattern that will locate all published files',
        '<<none>>'
    )
    .action(async (...args) => importDynamic('publish.js').then(m => m.publish(...args)));

program 
    .command('build')
    .description('Build your bot')
    .action(async (...args) => importDynamic('build.js').then(m => m.build(...args)))


program.parse();
