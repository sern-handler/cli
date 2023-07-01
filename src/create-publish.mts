/**
  * This file is meant to be run with the esm / cjs esbuild-kit loader to properly import typescript modules
  */


import { readdir, stat, mkdir } from 'fs/promises'
import { join, basename, extname, resolve, } from 'node:path'
import assert from 'node:assert'
import { getConfig } from './utilities/getConfig';
import { pathExistsSync } from 'find-up';
const args = process.argv.slice(2);
async function deriveFileInfo(dir: string, file: string) {
     const fullPath = join(dir, file);
     return {
       fullPath,
       fileStats: await stat(fullPath),
       base: basename(file)
     }
}

const validExtensions = ['.js', '.cjs', '.mts', '.mjs', 'cts'];
function createSkipCondition(base: string) {
    return ( type: 'file' | 'directory') => {
        if(type === 'file') {
           return base[0] === '!'
            || !validExtensions.includes(extname(base));
        }
        return base[0] === '!';
    }
}


async function* readPaths(dir: string, shouldDebug: boolean): AsyncGenerator<string> {
    try {
        const files = await readdir(dir);
        for (const file of files) {
            const { fullPath, fileStats, base } = await deriveFileInfo(dir, file);
            const isSkippable = createSkipCondition(base);
            if (fileStats.isDirectory()) {
                //Todo: refactor so that i dont repeat myself for files (line 71)
                if (isSkippable('directory')) {
                    if (shouldDebug) console.info(`ignored directory: ${fullPath}`);
                } else {
                    yield* readPaths(fullPath, shouldDebug);
                }
            } else {
                if (isSkippable('file')) {
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

//Where the actual script starts running
assert(process.env.DISCORD_TOKEN, "Could not find token")
assert(process.env.APP_ID, "Could not find application id")
const { paths } = await getConfig()
const filePaths = readPaths(resolve(paths.base, paths.cmds_dir), true)

for await (const file of filePaths) {
    let mod = await import(file).then(esm => esm.default)

    if('default' in mod) {
        mod = mod.default
    }

}
const cacheDir = resolve('.sern', '/')
if(!pathExistsSync(cacheDir)) {
   await mkdir(cacheDir); 
}

