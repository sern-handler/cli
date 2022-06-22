import { readFile, rename, writeFile } from 'node:fs/promises';
import { findUp } from 'find-up';

/**
 * It takes a string, finds the package.json file in the directory of the string, and changes the name
 * of the package.json file to the string.
 * @param {string} name - The name of the project.
 * @returns A promise.
 */
export async function editMain(name) {
	const pjLocation = await findUp('package.json', {
		cwd: process.cwd() + '/' + name,
	});

	const output = JSON.parse(await readFile(pjLocation, 'utf8'));
	if (!output) throw new Error("Can't read your package.json.");

	output.name = name;

	return writeFile(pjLocation, JSON.stringify(output, null, 2));
}

/**
 * It renames the `src` and `commands` directories, and edits the `index.ts` file to reflect the
 * changes
 * @param {string} srcName - The name of the folder that will contain your main files.
 * @param {string} cmds_dirName - The name of the directory where your commands will be stored.
 * @param {string} name - The name of the folder you want to edit.
 * @param {'javascript' | 'typescript'} lang - The language you want to use.
 * @returns void
 */
export async function editDirs(
	srcName,
	cmds_dirName,
	name,
	lang = 'typescript'
) {
	const path = await findUp('src', {
		cwd: process.cwd() + '/' + name,
		type: 'directory',
	});

	const ext = lang === 'typescript' ? 'ts' : 'js';

	const newMainDir = path?.replace('src', srcName);
	await rename(path, newMainDir);

	const cmdsPath = await findUp('commands', {
		cwd: process.cwd() + '/' + name + '/' + srcName,
		type: 'directory',
	});

	const index = await findUp(`index.${ext}`, {
		cwd: process.cwd() + '/' + name + '/' + srcName,
	});

	const newCmdsPath = cmdsPath?.replace('commands', cmds_dirName);
	await rename(cmdsPath, newCmdsPath);

	const tsconfig = await findUp('tsconfig.json', {
		cwd: process.cwd() + '/' + name,
	});

	if (tsconfig) {
		const output = JSON.parse(await readFile(tsconfig, 'utf8'));
		if (!output) throw new Error("Can't read your tsconfig.json.");
		output.compilerOptions.rootDir = srcName;

		writeFile(tsconfig, JSON.stringify(output, null, 2));
	}

	const output = await readFile(index, 'utf8');

	const oldfold = ext === 'ts' ? 'dist' : 'src';
	const newfold = ext === 'ts' ? 'dist' : srcName;

	const regex = new RegExp(`commands: '${oldfold}/commands'`);
	const edit = output.replace(
		regex,
		`commands: '${newfold}/${cmds_dirName}'`
	);

	return writeFile(index, edit);
}
