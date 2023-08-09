import { findUp } from 'find-up';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { fromCwd } from './fromCwd.js';

/**
 * It takes a string, finds the package.json file in the directory of the string, and changes the name
 * of the package.json file to the string.
 * @param name - The name of the project.
 */
export async function editMain(name: string) {
    const pjLocation = (await findUp('package.json', {
        cwd: fromCwd('/' + name),
    })) as string;

    const output = JSON.parse(await readFile(pjLocation, 'utf8'));
    if (!output) throw new Error("Can't read your package.json.");

    output.name = name;

    return writeFile(pjLocation, JSON.stringify(output, null, 2));
}

/**
 * It renames the `src` and `commands` directories, and edits the `index.ts` file to reflect the
 * changes
 * @param srcName - The name of the folder that will contain your main files.
 * @param cmds_dirName - The name of the directory where your commands will be stored.
 * @param name - The name of the folder you want to edit.
 * @param lang - The language you want to use.
 */
export async function editDirs(
    srcName: string,
    cmds_dirName: string,
    name: string,
    lang: 'javascript' | 'typescript' | 'javascript-esm' = 'typescript'
) {
    const path = (await findUp('src', {
        cwd: fromCwd(name),
        type: 'directory',
    })) as string;

    const ext = lang === 'typescript' ? 'ts' : 'js';

    const newMainDir = path?.replace('src', srcName);
    await rename(path, newMainDir);

    const cmdsPath = (await findUp('commands', {
        cwd: fromCwd(name, srcName),
        type: 'directory',
    })) as string;

    const index = (await findUp(`index.${ext}`, {
        cwd: fromCwd(name, srcName),
    })) as string;

    const newCmdsPath = cmdsPath?.replace('commands', cmds_dirName);
    await rename(cmdsPath, newCmdsPath);

    const tsconfig = await findUp('tsconfig.json', {
        cwd: process.cwd() + '/' + name,
    });

    if (tsconfig) {
        const output = JSON.parse(await readFile(tsconfig, 'utf8'));
        if (!output) throw new Error("Can't read your tsconfig.json.");
        output.compilerOptions.rootDir = srcName;

        await writeFile(tsconfig, JSON.stringify(output, null, 2));
    }

    const output = await readFile(index, 'utf8');

    const oldfold = ext === 'ts' ? 'dist' : 'src';
    const newfold = ext === 'ts' ? 'dist' : srcName;

    const regex = new RegExp(`commands: '${oldfold}/commands'`);
    const edit = output.replace(regex, `commands: '${newfold}/${cmds_dirName}'`);

    return writeFile(index, edit);
}
