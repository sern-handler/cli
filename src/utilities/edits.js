import { readFile, writeFile } from 'node:fs/promises';
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
	if (!output) throw new Error("Can't read file.");

	output.name = name;

	const result = () => writeFile(pjLocation, JSON.stringify(output, null, 2));
	return result();
}
