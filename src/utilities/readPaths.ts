import { readdir, stat } from 'fs/promises'
import { basename, join, extname } from 'path'
function isSkippable (filename: string) {
    //empty string is for non extension files (directories)
    const validExtensions = ['.js', '.cjs', '.mts', '.mjs', '.cts', '.ts', ''];
    return filename[0] === '!' || !validExtensions.includes(extname(filename));
}


async function deriveFileInfo(dir: string, file: string) {
    const fullPath = join(dir, file);
    return {
        fullPath,
        fileStats: await stat(fullPath),
        base: basename(file),
    };
}

export async function* readPaths(
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

