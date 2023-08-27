import { cyanBright, greenBright, magentaBright, underline } from 'colorette';
import { getSern } from '../utilities/getSern';
import { readFileSync } from 'node:fs';
import type { CommandData, GuildId } from '../utilities/types';

export function list() {
    const files = getSern();
    if (!files.includes('command-data-remote.json')) {
        console.error(`No commands found\nPlease run ${cyanBright('sern commands publish')} to publish your commands`);
        process.exit(1);
    }

    const commands: Record<GuildId, CommandData[]> = JSON.parse(readFileSync('.sern/command-data-remote.json', 'utf-8'));
    const globalCommands = commands.global;

    delete commands.global;
    console.log('Global Commands:');
    for (const command of globalCommands) log(command);

    console.log('\t');

    for (const guildId in commands) {
        const guildCommands = commands[guildId];
        console.log(`Guild Commands [${underline(cyanBright(guildId))}]`);
        for (const command of guildCommands) log(command);
    }
}

const AppCommandsType: Record<number, string> = {
    1: magentaBright('Slash'),
    2: magentaBright('User'),
    3: magentaBright('Message'),
};

const AppCommandOptionType: Record<number, string> = {
    1: magentaBright('SubCommand'),
    2: magentaBright('SubCommand Group'),
    3: magentaBright('String'),
    4: magentaBright('Integer'),
    5: magentaBright('Boolean'),
    6: magentaBright('User'),
    7: magentaBright('Channel'),
    8: magentaBright('Role'),
    9: magentaBright('Mentionable'),
    10: magentaBright('Number'),
    11: magentaBright('Attachment'),
};

function log(command: CommandData) {
    console.log(`\t${cyanBright(command.name)} ${command.description} (${greenBright(command.id)})`);
    console.log(`\t  Type: ${AppCommandsType[command.type]}`);
    if (command.options) {
        console.log(`\t  Options:`);
        for (const option of command.options) {
            console.log(`\t    ${cyanBright(option.name)}: ${AppCommandOptionType[option.type]}`);
            if (option.options) {
                console.log(`\t      Options:`);
                for (const subOption of option.options) {
                    console.log(`\t        ${cyanBright(subOption.name)}: ${AppCommandOptionType[subOption.type]}`);
                }
            }
        }
    }
}
