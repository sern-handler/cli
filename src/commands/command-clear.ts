import * as Rest from '../rest.js'
import assert from 'node:assert'
import dotenv from 'dotenv'
import type { CommandData, GuildId } from '../utilities/types.js';
import { readFileSync, writeFile } from 'node:fs'
import { resolve } from 'node:path'
import prompts from 'prompts';

export async function command_clear(args: Record<string,any>) {
    dotenv.configDotenv({ path: args.env || resolve('.env') })
    const token = process.env.token || process.env.DISCORD_TOKEN;
    const appid = process.env.applicationId || process.env.APPLICATION_ID;
    assert(token, 'Could not find a token for this bot in .env or commandline. Do you have DISCORD_TOKEN in env?');
    assert(appid, 'Could not find an application id for this bot in .env or commandline. Do you have APPLICATION_ID in env?');

    const response = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: 'Are you sure you want to delete your application commands?',
        initial: true
      }, { onCancel: () => (console.log("Cancelled operation  (￣┰￣*)"), process.exit(0)) });
    if (response.confirmation) {
        console.log('Deleting application commands...');
        const rest = Rest.create(appid, token);
        let guildCommands: Record<GuildId, CommandData[]> 
        try {
            guildCommands = JSON.parse(readFileSync('.sern/command-data-remote.json', 'utf-8'))
        } catch(e) {
            console.error("Something went wrong while trying to fetch .sern/command-data-remote.json") 
            console.error("Have you published your commands yet?")
            console.error("cannot properly delete all guild commands without this")
            throw e;
        }
        await rest.updateGlobal([]);
        delete guildCommands.global
        for (const guildId in guildCommands) {
            await rest.putGuildCommands(guildId, []);
        }
        writeFile('.sern/command-data-remote.json', "{}", (err) => {
            if(err) throw err
        })
    } else {
        console.log('Operation canceled.  (￣┰￣*)');
    }

}
