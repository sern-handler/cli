import { URL, fileURLToPath } from 'url';
import { resolve, dirname } from 'node:path';
import { readFile, mkdir, writeFile } from 'fs/promises';
const root = new URL('../', import.meta.url);

const templates = new URL('./templates/', root);
const extraURL = new URL('./extra/', templates);
const extraFolder = fileURLToPath(extraURL);

export async function create(name, lang, location, no_ext) {
	const file = `${name}.${lang}.sern`;

	const target = no_ext
		? `${location}/${name}`
		: `${location}/${name}.${lang}`;

	return createFile(file, target);
}

async function createFile(template, target) {
	const location = `${extraFolder}${template}`;

	const file = await readFile(location, 'utf8');

	await writeFileRecursive(target, file);
}

async function writeFileRecursive(target, data) {
	const resolvedTarget = resolve(target);
	const dir = dirname(resolvedTarget);

	await mkdir(dir, { recursive: true });

	return writeFile(resolvedTarget, data);
}
