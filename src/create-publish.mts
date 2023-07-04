/**
 * This file is meant to be run with the esm / cjs esbuild-kit loader to properly import typescript modules
 */

import { readdir, stat, mkdir, writeFile } from 'fs/promises';
import { join, basename, extname, resolve } from 'node:path';
import { pathExistsSync } from 'find-up';
const args = process.argv.slice(2);
async function deriveFileInfo(dir: string, file: string) {
	const fullPath = join(dir, file);
	return {
		fullPath,
		fileStats: await stat(fullPath),
		base: basename(file),
	};
}



const validExtensions = ['.js', '.cjs', '.mts', '.mjs', 'cts', '.ts'];
function createSkipCondition(base: string) {
	return (type: 'file' | 'directory') => {
		if (type === 'file') {
			return base[0] === '!' || !validExtensions.includes(extname(base));
		}
		return base[0] === '!';
	};
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
			const isSkippable = createSkipCondition(base);
			if (fileStats.isDirectory()) {
				//Todo: refactor so that i dont repeat myself for files (line 71)
				if (isSkippable('directory')) {
					if (shouldDebug)
						console.info(`ignored directory: ${fullPath}`);
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
//recieved paths object
const paths = await new Promise<Record<string,string>>( (resolve) => {
    process.once('message', resolve)
});
const publishAll = process.env.all === 'T'

if(publishAll && process.env.pattern !== '<<none>>') {
    throw Error('--all flag and pattern argument are mutually exclusive');
}

console.debug('all:', publishAll)
console.debug('pattern:', process.env.pattern)

//Where the actual script starts running
//assert(process.env.DISCORD_TOKEN, 'Could not find token');
//assert(process.env.APP_ID, 'Could not find application id');
const filePaths = readPaths(resolve(paths.base, paths.commands), true);
const modules = [];
const publishable = 0b1110;
for await (const absPath of filePaths) {
    let mod = await import(absPath).then((esm) => esm.default);
    if ('default' in mod) {
	mod = mod.default;
    }
    try {
       mod = mod.getInstance() 
    } catch {}

    if((publishable & mod.type) != 0) {
        //assign defaults 
        const filename = basename(absPath)
        const filenameNoExtension = filename.substring(0, filename.lastIndexOf('.'))
        mod.name ??= filenameNoExtension
        mod.description ??= ''
        modules.push(mod)
    };
    
}
const cacheDir = resolve('./.sern');
if (!pathExistsSync(cacheDir)) {
    console.log('Making .sern directory: ', cacheDir);
    await mkdir(cacheDir);
}


interface Typeable {
    type: number
}
function optionsTransformer(ops: Array<Typeable>) {
    return ops.map((el) => {
        if('subcommand' in el) {
            delete el.subcommand; 
        }
        return el;
    });
}

const intoApplicationType = (type: number) => {
    if(type === 3) {
        return 1;
    }
    return Math.log2(type);
}

const makeDescription = (type: number, desc: string) => {
    if(type !== 1 && desc !== '') {
        console.warn('Found context menu that has non empty description field. Implictly publishing with empty description')
        return '';
    }
    return desc;
}

const makePublishData = (module: Record<string, unknown>) => {
    const applicationType = intoApplicationType(module.type as number);

    return { 
        name: module.name,
        type: applicationType,
        description: makeDescription(applicationType, module.description as string),
        options: optionsTransformer((module?.options ?? []) as Typeable[]),
    }
}

//We can use these objects to publish to DAPI
const publishableData = modules.map(makePublishData);

await writeFile(
    resolve(cacheDir, 'command-data.json'),
    JSON.stringify(publishableData), 
    'utf8'
);


//need this to exit properly
process.exit(0)
