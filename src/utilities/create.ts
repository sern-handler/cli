import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'url';
const root = new URL('../../', import.meta.url);
const cli = new URL('./cli/', root);
const templates = new URL('./templates/', cli);
const extraURL = new URL('./extra/', templates);
const extraFolder = fileURLToPath(extraURL);

/**
 * It creates a file with the name `name.lang.sern` in the `location` directory
 * @param  name - The name of the file.
 * @param  lang - The language you want to use.
 * @param  location - The location of the file to be created.
 * @param  no_ext - If true, the file will be created without an extension.
 */
export async function create(
	name: string,
	lang: string,
	location: string,
	no_ext: boolean
) {
	const file = `${name}.${lang}.sern`;

	const target = no_ext
		? `${location}/${name}`
		: `${location}/${name}.${lang}`;

	return createFile(file, target);
}

/**
 * It reads a file from a template folder, and writes it to a target folder
 * @param template - The name of the file to be created.
 * @param target - The location of the file to be created.
 */
async function createFile(template: string, target: string) {
	const location = `${extraFolder}${template}`;

	const file = await readFile(location, 'utf8');

	await writeFileRecursive(target, file);
}

/**
 * It creates a directory recursively, then writes a file to it
 * @param target - The path to the file you want to write to.
 * @param data - The data to write to the file.
 * @returns A promise that resolves to the result of the writeFile function.
 */
async function writeFileRecursive(target: string, data: string) {
	const resolvedTarget = resolve(target);
	const dir = dirname(resolvedTarget);

	await mkdir(dir, { recursive: true });

	return writeFile(resolvedTarget, data);
}
