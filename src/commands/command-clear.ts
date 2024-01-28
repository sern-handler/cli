import * as Rest from '../rest.js'
import assert from 'node:assert'
import dotenv from 'dotenv'
import ora from 'ora';
import type { CommandData, GuildId } from '../utilities/types.js';
import { readFileSync, writeFile } from 'node:fs'
import { resolve } from 'node:path'
import prompts from 'prompts';

const getConfirmation = (args: Record<string,any> ) => {
    if(args.yes) {
        return args.yes
    } else {
        return prompts({
            type: 'confirm',
            name: 'confirmation',
            message: 'Are you sure you want to delete ALL your application commands?',
            initial: true
        }, { onCancel: () => (console.log("Cancelled operation  (￣┰￣*)"), process.exit(1)) })
        .then(response => response.confirmation);
    }
}
export async function commandClear(args: Record<string,any>) {
    dotenv.configDotenv({ path: args.env || resolve('.env') })
    const token = process.env.token || process.env.DISCORD_TOKEN;
    const appid = process.env.applicationId || process.env.APPLICATION_ID;
    assert(token, 'Could not find a token for this bot in .env or commandline. Do you have DISCORD_TOKEN in env?');
    assert(appid, 'Could not find an application id for this bot in .env or commandline. Do you have APPLICATION_ID in env?');
    
    const confirmation = await getConfirmation(args);
   
    if (confirmation) {
        const spin = ora({
            text: `Deleting ALL application commands...`,
            spinner: 'aesthetic',
        }).start();
        const rest = Rest.create(appid, token);
        let guildCommands: Record<GuildId, CommandData[]> 
        try {
            guildCommands = JSON.parse(readFileSync('.sern/command-data-remote.json', 'utf-8'))
            await rest.updateGlobal([]);
            delete guildCommands.global
            for (const guildId in guildCommands) {
                await rest.putGuildCommands(guildId, []);
            }
            writeFile('.sern/command-data-remote.json', "{}", (err) => {
                if(err) {
                    spin.fail("Error happened while writing to json:");
                    console.error(err)
                    process.exit(1)
                }
            })
            spin.succeed();
        } catch(e) {
            spin.fail("Something went wrong. ");
            throw e;
        }
    } else {
        console.log('Operation canceled.  (￣┰￣*)');
    }

}
