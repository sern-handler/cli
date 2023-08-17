#!/usr/bin/env node

import { Command } from 'commander';
import { yellowBright } from 'colorette';
export const program = new Command();

const importDynamic = async <T extends string>(filename: T) => import(`./commands/${filename}` as const)
declare const __VERSION__: string

program
    .name('sern')
    .description(await importDynamic('help.js').then(m => m.help))
    .version(`sern CLI v${__VERSION__}`, '-v, --version')
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
    .action((...args) => importDynamic('extra.js').then(m => m.extra(...args)));

program //
    .command('commands')
    .description('Defacto way to manage your slash commands')
    .addCommand(
        new Command('publish')
            .description('New way to manage your slash commands')
            .option('-W --suppress-warnings', 'suppress experimental warning')
            .option('-i, --import [scriptPath...]', 'Prerequire a script to load into publisher')
            .option('-t, --token [token]')
            .option('--appId [applicationId]')
            .argument('[path]', 'path with respect to current working directory that will locate all published files')
            .action(async (...args) => importDynamic('publish.js').then(m => m.publish(...args)))
    );

program 
    .command('build')
    .description('Build your bot')
    .option('-W --suppress-warnings', 'suppress experimental warning')
    .option('-p --project [filePath]', 'build with this sern.build file')
    .action(async (...args) => importDynamic('build.js').then(m => m.build(...args)))

program.parse();
