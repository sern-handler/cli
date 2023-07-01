import { readdir, stat } from 'fs/promises'
import { join, basename, extname } from 'node:path'

const args = process.argv.slice(5);
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



