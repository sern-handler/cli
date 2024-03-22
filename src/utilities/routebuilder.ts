import { readdir, stat } from 'fs/promises';
import { basename, join, parse, dirname } from 'path';
import assert from 'assert';


/**
 * Import any module based on the absolute path.
 * This can accept four types of exported modules
 * commonjs, javascript :
 * ```js
 * exports = commandModule({ })
 *
 * //or
 * exports.default = commandModule({ })
 * ```
 * esm javascript, typescript, and commonjs typescript
 * export default commandModule({})
 */
export async function importModule<T>(absPath: string) {
    let fileModule = await import(absPath);

    let commandModule = fileModule.default;

    assert(commandModule , `Found no export @ ${absPath}. Forgot to ignore with "!"? (!${basename(absPath)})?`);
    if ('default' in commandModule ) {
        commandModule = commandModule.default;
    }
    return { module: commandModule } as T;
}


export const fmtFileName = (fileName: string) => parse(fileName).name;


export const getfilename = (path: string) => fmtFileName(basename(path));



async function deriveFileInfo(dir: string, file: string) {
    const fullPath = join(dir, file);
    return { fullPath,
             fileStats: await stat(fullPath),
             base: basename(file) };
}

function parseWildcardName(filename: string): string | null {
  const wildcardMatch = filename.match(/\[(.*?)\]/);
  return wildcardMatch ? wildcardMatch[1] : null;
}

export class RouteEntry {
    public import_path: string
    public filename: string
    public parent: string
    public wildcardName: string | null;
    constructor(public route: string) {
        this.import_path = "file:///"+route
        this.filename = getfilename(this.route)
        this.parent = dirname(this.route);
        this.wildcardName = parseWildcardName(this.filename);
    }
}

export interface ReadPathsConfig {
    dir: string
    onDir?: (dir: string) => Promise<boolean>|boolean
    onEntry?: (etry: RouteEntry) => RouteEntry
}

export async function* readPaths(
    config: ReadPathsConfig
): AsyncGenerator<RouteEntry> {
    const files = await readdir(config.dir);
    for (const file of files) {
        const { fullPath, fileStats } = await deriveFileInfo(config.dir, file);
        if (fileStats.isDirectory()) {
            if(config.onDir && await config.onDir(fullPath)) {
                yield* readPaths({ ...config, dir: fullPath });
            } else {
                yield* readPaths({ ...config, dir: fullPath });
            }
        } else {
            const nowindowsPath = fullPath.replace(/\\/g, '/');
            if(config.onEntry) {
                yield config.onEntry(new RouteEntry(nowindowsPath));
            } else {
                yield new RouteEntry(nowindowsPath);
            }
        }
    }
}

