import type { PublishableModule } from "./create-publish.d.ts";


const baseURL = new URL('https://discord.com/api/v10/applications/')

const excludedKeys = new Set(['command', 'absPath']);

const publishablesIntoJson = (ps : PublishableModule[]) => 
    JSON.stringify(ps.map(module => module.data), (key, value) => (excludedKeys.has(key) ? undefined : value), 4)

export const create = (appid: string, token: string) => {
    const globalURL = new URL(`${appid}/commands`, baseURL)
    const headers = {
        'Authorization': 'Bot '+ token,  
        'Content-Type': 'application/json'
    }
    return {
        updateGlobal : (commands: PublishableModule[]) => 
            fetch(globalURL, { method: 'PUT', body: publishablesIntoJson(commands), headers }),
                getGuild: (id: string) => {
            const guildCommandURL = new URL(`${appid}/guilds/${id}/commands`, baseURL)
            return fetch(guildCommandURL, { headers })
        },

        editGuildCommand: (guildId: string, guildCommand: any) => {
            const guildCommandURL = new URL(`${appid}/guilds/${guildId}/commands`, baseURL)
            const editCommandUrl = new URL(guildCommand.id, guildCommandURL+'/')
            return fetch(editCommandUrl,
                { method: 'PATCH', body: JSON.stringify(guildCommand), headers }
            )

        },
        createGuildCommand: (guildCommand: any, guildId: string) => {
            const guildCommandURL = new URL(`${appid}/guilds/${guildId}/commands`, baseURL)
            return fetch(guildCommandURL,
                { method: 'POST', body: JSON.stringify(guildCommand), headers }
            )
        }

    }
}
