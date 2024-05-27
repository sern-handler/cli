import type { PublishableModule } from './create-publish.d.ts';

const baseURL = new URL('https://discord.com/api/v10/applications/');

const excludedKeys = new Set(['command', 'absPath']);

const publishablesIntoJson = (ps: PublishableModule[]) => {
    const s = JSON.stringify(
        ps.map((module) => module.data),
        (key, value) => (excludedKeys.has(key) ? undefined : value), 4);
    return s;
}

export const create = async (token: string) => {
    const headers = {
        Authorization: 'Bot ' + token,
        'Content-Type': 'application/json',
    };
    let me;
    let appid: string;
    try {
        me = await fetch(new URL('@me', baseURL), { headers }).then(res => res.json());
        appid = me.id;
    } catch(e) {
        console.log("Something went wrong while trying to fetch your application:");
        throw e;
    }
    const globalURL = new URL(`${appid}/commands`, baseURL);
    
    return {
        updateGlobal: (commands: PublishableModule[]) =>
            fetch(globalURL, {
                method: 'PUT',
                body: publishablesIntoJson(commands),
                headers,
            }),
        getGuildCommands: (id: string) => {
            const guildCommandURL = new URL(`${appid}/guilds/${id}/commands`, baseURL);
            return fetch(guildCommandURL, { headers });
        },

        putGuildCommands: (guildId: string, guildCommand: unknown) => {
            const guildCommandURL = new URL(`${appid}/guilds/${guildId}/commands`, baseURL);
            return fetch(guildCommandURL, {
                method: 'PUT',
                body: JSON.stringify(guildCommand),
                headers,
            });
        },
    };
};
