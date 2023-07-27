/**
 * This file is meant to be run with the esm / cjs esbuild-kit loader to properly import typescript modules
 */

import { readdir, stat, mkdir, writeFile, readFile } from 'fs/promises';
import { join, basename, extname, resolve } from 'node:path';
import { pathExistsSync } from 'find-up';
import assert from 'assert'
import * as Rest from './rest'
import type { sernConfig } from './utilities/getConfig';
import type { PublishableModule } from './create-publish.d.ts';
const args = process.argv.slice(2);
async function deriveFileInfo(dir: string, file: string) {
    const fullPath = join(dir, file);
    return {
        fullPath,
        fileStats: await stat(fullPath),
        base: basename(file),
    };
}

function isSkippable (filename: string) {
    //empty string is for non extension files (directories)
    const validExtensions = ['.js', '.cjs', '.mts', '.mjs', '.cts', '.ts', ''];
    return filename[0] === '!' || !validExtensions.includes(extname(filename));
}

async function* readPaths(
    dir: string,
    shouldDebug: boolean
): AsyncGenerator<string> {
    try {
        const files = await readdir(dir);
        for (const file of files) {
            const { fullPath, fileStats, base } = await deriveFileInfo(
                dir,
                file
            );
            if (fileStats.isDirectory()) {
                //Todo: refactor so that i dont repeat myself for files (line 71)
                if (isSkippable(base)) {
                    if (shouldDebug)
                        console.info(`ignored directory: ${fullPath}`);
                } else {
                    yield* readPaths(fullPath, shouldDebug);
                }
            } else {
                if (isSkippable(base)) {
                    if (shouldDebug) console.info(`ignored: ${fullPath}`);
                } else {
                    yield 'file:///' + fullPath;
                }
            }
        }
    } catch (err) {
        throw err;
    }
}
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
await writeFile(
    resolve(cacheDir, 'command-data-local.json'),
    publishablesIntoJson(publishableData),
    'utf8'
);


const dotenv = await import('dotenv')

interface TheoreticalEnv {
    DISCORD_TOKEN: string
    APPLICATION_ID: string,
    [name: string]: string
}

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
let remoteGlobal;
if(res.ok) {
    console.log('All global commands published')
    remoteGlobal = await res.json()
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
console.log(remoteGlobal)
const guildIds = new Set<string>()

for(const { config, data } of guildedCommands) {
     if(config.guildIds) {
        for(const id of config.guildIds) {
            !guildIds.has(id) && guildIds.add(id);
            const guild = await rest.getGuild(id)
                .then(res => res.json())
                .catch(() => null);
            assert(guild, `guild with id ${id} does not exist`)
            const guildCommands = await rest
                .getGuildCommands(id)
                .then(res => res.json())
                .catch((e) => { throw e });
            
            const guildCmd = guildCommands
                .find((command: Record<string,unknown>) => command.name === data.name && command.type === data.type);
	    if (guildCmd) {
                const response = await rest.editGuildCommand(id, guildCmd)
                if(response.ok) {
                    console.log('Edited ', data.name, ' for guild', id, ' correctly!')
                } else {
                    throw Error(`Something went wrong while trying to edit ${data.name} for ${id}`)
                }
	    } else {
                const response = await rest.createGuildCommand(guildCmd, id) 
                if(response.ok) {
                    console.log('Created ', data.name, ' for guild', id, ' correctly!')
                } else {
                    throw Error(`Something went wrong while trying to create ${data.name} for ${id}`)
                }            
            }
        }
     }
}

// need this to exit properly
process.exit(0);
