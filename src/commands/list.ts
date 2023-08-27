import { cyanBright, magentaBright, underline } from 'colorette';
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

    for (const guildId in commands) {
        const guildCommands = commands[guildId];
        console.log(`Guild Commands [${underline(cyanBright(guildId))}]`);
        for (const command of guildCommands) log(command);
    }
}

const AppCommandsType: Record<number, string> = {
    1: magentaBright('SLASH'),
    2: magentaBright('USER'),
    3: magentaBright('MESSAGE'),
};

const AppCommandOptionType: Record<number, string> = {
    1: magentaBright('SUB_COMMAND'),
    2: magentaBright('SUB_COMMAND_GROUP'),
    3: magentaBright('STRING'),
    4: magentaBright('INTEGER'),
    5: magentaBright('BOOLEAN'),
    6: magentaBright('USER'),
    7: magentaBright('CHANNEL'),
    8: magentaBright('ROLE'),
    9: magentaBright('MENTIONABLE'),
    10: magentaBright('NUMBER'),
    11: magentaBright('ATTACHMENT'),
};

function log(command: CommandData) {
    const tableData = {
        Name: command.name,
        Description: command.description,
        ID: command.id,
        Type: AppCommandsType[command.type],
    };

    if (command.options) {
        for (const option of command.options) {
            tableData[`Option: ${option.name}`] = option.description;
            tableData[`Type: ${option.name}`] = AppCommandOptionType[option.type];

            if (option.choices) {
                for (const choice of option.choices) {
                    tableData[`Choice: ${choice.name}`] = choice.value;
                }
            }
        }
    }

    console.table(tableData);
}
