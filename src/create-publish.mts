/**
 * This file is meant to be run with the esm / cjs esbuild-kit loader to properly import typescript modules
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import { basename, resolve } from 'node:path';
import { pathExistsSync } from 'find-up';
import assert from 'assert'
import * as Rest from './rest'
import type { Config, PublishableData, PublishableModule } from './create-publish.d.ts';
import type { sernConfig } from './types/config.d.ts';
import { readPaths } from './utilities/readPaths.js';
const args = process.argv.slice(2);


//recieved sern config
const config = await new Promise<sernConfig>((resolve) => {
        process.once('message', resolve);
    }),
    { paths } = config;

const publishAll = process.env.all === 'T';

if (publishAll && process.env.pattern !== '<<none>>') {
    throw Error('--all flag and pattern argument are mutually exclusive');
}

console.debug('all:', publishAll);
console.debug('pattern:', process.env.pattern);

//Where the actual script starts running
//assert(process.env.DISCORD_TOKEN, 'Could not find token');
//assert(process.env.APP_ID, 'Could not find application id');
const filePaths = readPaths(resolve(paths.base, paths.commands), true);

const modules = [];
const publishable = 0b1110;
for await (const absPath of filePaths) {
    let mod = await import(absPath)
    let commandModule = mod.default;
    let config = mod.config;
    if ('default' in commandModule) {
        commandModule = commandModule.default;
    }
    if(typeof config === 'function') {
        config = config(absPath, commandModule)
    }
    try {
        commandModule = commandModule.getInstance();
    } catch {}

    if ((publishable & commandModule.type) != 0) {
        // assign defaults
        const filename = basename(absPath);
        const filenameNoExtension = filename.substring(
            0,
            filename.lastIndexOf('.')
        );
        commandModule.name ??= filenameNoExtension;
        commandModule.description ??= '';
        commandModule.absPath = absPath;
        modules.push({ commandModule, config });
    }
}

const cacheDir = resolve('./.sern');
if (!pathExistsSync(cacheDir)) {
    console.log('Making .sern directory: ', cacheDir);
    await mkdir(cacheDir);
}

interface Typeable {
    type: number;
}
const optionsTransformer = (ops: Array<Typeable>) => {
    return ops.map((el) => {
        if ('command' in el) {
            const { command, ...rest } = el;
            return rest;
        }
        return el;
    });
}

const intoApplicationType = (type: number) => {
    if (type === 3) {
        return 1;
    }
    return Math.log2(type);
};

const makeDescription = (type: number, desc: string) => {
    if (type !== 1 && desc !== '') {
        console.warn(
            'Found context menu that has non empty description field. Implictly publishing with empty description'
        );
        return '';
    }
    return desc;
};

const makePublishData = ( { commandModule, config }: Record<string, Record<string,unknown>>) => {
    const applicationType = intoApplicationType(commandModule.type as number);
    return {
        data: {
            name: commandModule.name as string,
            type: applicationType,
            description: makeDescription(applicationType, commandModule.description as string),
            absPath: commandModule.absPath as string,
            options: optionsTransformer((commandModule?.options ?? []) as Typeable[]),
            dm_permission: config?.dmPermission,
            default_member_permissions: config?.defaultMemberPermissions ?? null
        },
        config 
    };
};

const publishablesIntoJson = (ps : PublishableModule[]) => 
    JSON.stringify(ps.map(module => module.data), (key, value) => (excludedKeys.has(key) ? undefined : value), 4)
// We can use these objects to publish to DAPI
const publishableData = modules.map(makePublishData);
const excludedKeys = new Set(['command', 'absPath']);

const dotenv = await import('dotenv')
const env = dotenv.parse<TheoreticalEnv>(await readFile(resolve('.env')))


const token = env.DISCORD_TOKEN ?? process.env.token;
const appid = env.APPLICATION_ID ?? process.env.applicationId;

assert(
    token,
    "Could not find a token for this bot in .env or commandline. Do you have DISCORD_TOKEN in env?"
)
assert(
    appid, 
    "Could not find an application id for this bot in .env or commandline. Do you have APPLICATION_ID in env?"
)


//partition globally published and guilded commands
const [globalCommands, guildedCommands] = publishableData.reduce(
    ([globals, guilded], module) => {
        const isPublishableGlobally = !module.config || !Array.isArray(module.config.guildIds)
        if(isPublishableGlobally) {
            return [[module , ...globals], guilded];
        } 
        return [globals, [module, ...guilded]];

    }, [[], []] as [PublishableModule[], PublishableModule[]]);
console.log('publishing global commands')


const rest = Rest.create(appid, token);
const res = await rest.updateGlobal(globalCommands);

let globalCommandsResponse;

if(res.ok) {
    console.log('All global commands published')
    globalCommandsResponse = await res.json()
} else {
    console.error('code: ', res.status)
    if(res.status === 429) {
        throw Error("Chill out homie, too many requests")
    }
    console.error('errors:', await res.json()
        .then(res => {
            const errors = Object.values(res.errors)
            //@ts-ignore
            return errors.map(err => err?.name?._errors);
        }))
    console.error(res.statusText)
    throw Error("Failed to published global commands")
}

function associateGuildIdsWithData(data: {
  data: PublishableData;
  config?: Config;
}[]): Map<string, PublishableData[]> {
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

for(const [guildId, array] of guildCommandMap.entries()) {
    console.log('Updating commands for guild', guildId)

    const response = await rest.putGuildCommands(guildId, array)
    if(res.ok) {
        guildCommandMapResponse.set(guildId, await response.json())
    } else {
        throw Error(await res.json())
    }
    
}
const remoteData = {
    global: globalCommandsResponse,
    ...Object.fromEntries(guildCommandMapResponse)
}

await writeFile(
    resolve(cacheDir, 'command-data-remote.json'),
    JSON.stringify(remoteData, null, 4),
    'utf8'
);


process.exit(0);
