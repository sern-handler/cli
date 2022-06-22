import { URL, fileURLToPath } from 'url';
import { resolve, dirname } from 'node:path';
import { readFile, mkdir, writeFile } from 'fs/promises';
const root = new URL('../', import.meta.url);

const templates = new URL('./templates/', root);
const extraURL = new URL('./extra/', templates);
const extraFolder = fileURLToPath(extraURL);


/**
 * It creates a file with the name `name.lang.sern` in the `location` directory
 * @param {string} name - The name of the file.
 * @param {string} lang - The language you want to use.
 * @param {string} location - The location of the file to be created.
 * @param {boolean} no_ext - If true, the file will be created without an extension.
 * @returns File
 */
export async function create(name, lang, location, no_ext) {
	const file = `${name}.${lang}.sern`;

	const target = no_ext
		? `${location}/${name}`
		: `${location}/${name}.${lang}`;

	return createFile(file, target);
}

/**
 * It reads a file from a template folder, and writes it to a target folder
 * @param {string} template - The name of the file to be created.
 * @param {string} target - The location of the file to be created.
 */
async function createFile(template, target) {
	const location = `${extraFolder}${template}`;

	const file = await readFile(location, 'utf8');

	await writeFileRecursive(target, file);
}

/**
 * It creates a directory recursively, then writes a file to it
 * @param {string} target - The path to the file you want to write to.
 * @param {string} data - The data to write to the file.
 * @returns A promise that resolves to the result of the writeFile function.
 */
async function writeFileRecursive(target, data) {
	const resolvedTarget = resolve(target);
	const dir = dirname(resolvedTarget);

	await mkdir(dir, { recursive: true });

	return writeFile(resolvedTarget, data);
}
