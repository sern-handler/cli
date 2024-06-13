/**
 * This file is meant to be run with the esm / cjs esbuild-kit loader to properly import typescript modules
 */

import { readdir, mkdir, writeFile } from 'fs/promises';
import { basename, resolve, posix as pathpsx } from 'node:path';
import { pathExistsSync } from 'find-up';
import assert from 'assert';
import { once } from 'node:events';
import * as Rest from './rest';
import type { SernConfig } from './utilities/getConfig';
import type { PublishableData, PublishableModule, Typeable } from './create-publish.d.ts';
import { cyanBright, greenBright, redBright } from 'colorette';
import { inspect } from 'node:util'
import ora from 'ora';


async function* readPaths(dir: string, shouldDebug: boolean): AsyncGenerator<string> {
    const files = await readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = pathpsx.join(dir, file.name);
        if (file.isDirectory()) {
            if (!file.name.startsWith('!')) {
                yield* readPaths(fullPath, shouldDebug);
            }
        } else if (!file.name.startsWith('!')) {
            yield "file:///"+resolve(fullPath);
        }
    }
}

// recieved sern config
const [{ config, preloads, commandDir }] = await once(process, 'message'),
    { paths } = config as SernConfig;

for (const preload of preloads) {
    console.log("preloading: ", preload);
    await import('file:///' + resolve(preload));
}

const commandsPath = commandDir ? resolve(commandDir) : resolve(paths.base, paths.commands);
const filePaths = readPaths(commandsPath, true);
const modules = [];
const PUBLISHABLE = 0b1110;

for await (const absPath of filePaths) {
    let mod = await import(absPath);
    let commandModule = mod.default;
    let config = mod.config;

    if ('default' in commandModule) {
        commandModule = commandModule.default;
    }

    if (typeof config === 'function') {
        config = config(absPath, commandModule);
    }

    if ((PUBLISHABLE & commandModule.type) != 0) {
        // assign defaults
        const filename = basename(absPath);
        const filenameNoExtension = filename.substring(0, filename.lastIndexOf('.'));
        commandModule.name ??= filenameNoExtension;
        commandModule.description ??= '';
        commandModule.meta = {
            absPath
        }

        modules.push({ commandModule, config });
    }
}

const cacheDir = resolve('./.sern');
if (!pathExistsSync(cacheDir)) {
    // TODO: add this in verbose flag
    // console.log('Making .sern directory: ', cacheDir);
    await mkdir(cacheDir);
}

const optionsTransformer = (ops: Array<Typeable>) => {
    return ops.map((el) => {
        if ('command' in el) {
            const { command, ...rest } = el;
            return rest;
        }
        return el;
    });
};

const intoApplicationType = (type: number) => {
    if (type === 3) {
        return 1;
    }
    return Math.log2(type);
};

const makeDescription = (type: number, desc: string) => {
    if (type !== 1 && desc !== '') {
        console.warn('Found context menu that has non empty description field. Implictly publishing with empty description');
        return '';
    }
    return desc;
};
const serialize = (permissions: unknown) => {
    if(typeof permissions === 'bigint' || typeof permissions === 'number') {
       return permissions.toString(); 
    }

    if(Array.isArray(permissions)) {
        return permissions
            .reduce((acc, cur) => acc | cur, BigInt(0))
            .toString()
    }
    return null;
}

const makePublishData = ({ commandModule, config }: Record<string, Record<string, unknown>>) => {
    const applicationType = intoApplicationType(commandModule.type as number);
    return {
        data: {
            name: commandModule.name as string,
            type: applicationType,
            description: makeDescription(applicationType, commandModule.description as string),
            absPath: commandModule.absPath as string,
            options: optionsTransformer((commandModule?.options ?? []) as Typeable[]),
            dm_permission: config?.dmPermission ?? false,
            default_member_permissions: serialize(config?.defaultMemberPermissions),
            //@ts-ignore
            integration_types: (config?.integrationTypes ?? ['Guild']).map(
                (s: string) => {
                    if(s === "Guild") {
                        return 0
                    } else if (s == "User") {
                        return 1
                    } else {
                        throw Error("IntegrationType is not one of Guild (0) or User (1)");
                    }
                }),
            //@ts-ignore
            contexts: config?.contexts ?? undefined,
            name_localizations: commandModule.name_localizations,
            description_localizations: commandModule.description_localizations
        },
        config,
    };
};

// We can use these objects to publish to DAPI
const publishableData = modules.map(makePublishData),
    token = process.env.token || process.env.DISCORD_TOKEN;

assert(token, 'Could not find a token for this bot in .env or commandline. Do you have DISCORD_TOKEN in env?');
// partition globally published and guilded commands
const [globalCommands, guildedCommands] = publishableData.reduce(
    ([globals, guilded], module) => {
        const isPublishableGlobally = !module.config || !Array.isArray(module.config.guildIds);
        if (isPublishableGlobally) {
            return [[module, ...globals], guilded];
        }
        return [globals, [module, ...guilded]];
    },
    [[], []] as [PublishableModule[], PublishableModule[]]
);

const spin = ora(`Publishing ${cyanBright('Global')} commands`);

globalCommands.length && spin.start();

const rest = await Rest.create(token);
const res = await rest.updateGlobal(globalCommands);

let globalCommandsResponse: unknown;


if (res.ok) {
    globalCommands.length && spin.succeed(`All ${cyanBright('Global')} commands published`);
    globalCommandsResponse = await res.json();
} else {
    spin.fail(`Failed to publish global commands [Code: ${redBright(res.status)}]`);
    let err: Error
    console.error("Status Text ", res.statusText);
    switch(res.status) {
        case 400 : {
            const validation_errors = await res.json()
            console.error('errors:', inspect(validation_errors, { depth: Infinity }));
            console.error("Modules with validation errors:" 
                          + inspect(Object.keys(validation_errors.errors).map(idx => globalCommands[idx as any])))
            throw Error("400: Ensure your commands have proper fields and data with nothing left out");
        }
        case 404 : {
            console.error('errors:', inspect(await res.json(), { depth: Infinity }));
            throw Error("Forbidden 404. Is you application id and/or token correct?")
        } 
        case 429: {
            console.error('errors:', inspect(await res.json(), { depth: Infinity }));
            err = Error('Chill out homie, too many requests') 
        } break;
        default: {
            console.error('errors:', inspect(await res.json(), { depth: Infinity }));
            throw Error(res.status.toString() + " error")
        }
    }
}

function associateGuildIdsWithData(data: PublishableModule[]): Map<string, PublishableData[]> {
    const guildIdMap: Map<string, PublishableData[]> = new Map();

    data.forEach((entry) => {
        const { data, config } = entry;
        const { guildIds } = config || {};

        if (guildIds) {
            guildIds.forEach((guildId) => {
                if (guildIdMap.has(guildId)) {
                    guildIdMap.get(guildId)?.push(data);
                } else {
                    guildIdMap.set(guildId, [data]);
                }
            });
        }
    });
    return guildIdMap;
}
const guildCommandMap = associateGuildIdsWithData(guildedCommands);
let guildCommandMapResponse = new Map<string, Record<string, unknown>>();

for (const [guildId, array] of guildCommandMap.entries()) {
    const spin = ora(`[${cyanBright(guildId)}] Updating commands for guild`);
    spin.start();

    const response = await rest.putGuildCommands(guildId, array);
    const result = await response.json();

    if (response.ok) {
        guildCommandMapResponse.set(guildId, result);
        spin.succeed(`[${greenBright(guildId)}] Successfully updated commands for guild`);
    } else {
        spin.fail(`[${redBright(guildId)}] Failed to update commands for guild, Reason: ${result.message}`);
        switch(response.status) {
            case 400 : {
                console.error(inspect(result, { depth: Infinity }))
                console.error("Modules with validation errors:" 
                + inspect(Object.keys(result.errors).map(idx => array[idx as any])))

                throw Error("400: Ensure your commands have proper fields and data and nothing left out");
            }
            case 404 : {
                console.error(inspect(result, { depth: Infinity }))
                throw Error("Forbidden 404. Is you application id and/or token correct?")
            }
            case 429: {
                console.error(inspect(result, { depth: Infinity }))
                throw Error('Chill out homie, too many requests')
            }
        }
    }
}
const remoteData = {
    global: globalCommandsResponse,
    ...Object.fromEntries(guildCommandMapResponse),
};

await writeFile(resolve(cacheDir, 'command-data-remote.json'), JSON.stringify(remoteData, null, 4), 'utf8');

// TODO: add this in a verbose flag
// console.info('View json output in ' + resolve(cacheDir, 'command-data-remote.json'));
process.exit(0);
