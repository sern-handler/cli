import { execa } from 'execa';
import { redBright } from 'colorette';
import fs from 'fs';
import path from 'path';
import { readFile } from 'fs/promises';
import { findUp } from 'find-up';
import ora from 'ora';

/**
 * It installs dependencies from a package.json file
 * @param {'skip' | 'npm' | 'yarn'} choice - The package manager to use.
 * @param {string} name - The name of the project
 * @returns a promise.
 */
export async function installDeps(choice, name) {
	const pkg = await findUp('package.json', {
		cwd: process.cwd() + '/' + name,
	});
	if (!pkg) throw new Error('No package.json found!');

	const output = JSON.parse(await readFile(pkg, 'utf8'));
	if (!output) throw new Error("Can't read file.");

	const deps = output.dependencies;
	if (!deps) throw new Error("Can't find dependencies.");

	if (choice === 'skip') {
		return console.log('Dependency installation skipped...');
	}

	const spin = ora({
		text: `Installing dependencies...`,
		spinner: 'aesthetic',
	}).start();

	const result = await execa(choice, ['install'], {
		cwd: process.cwd() + '/' + name,
	}).catch(() => null);
	if (!result || result?.failed) {
		spin.fail(`${redBright('Failed')} to install dependencies!`);
		process.exit(1);
	} else spin.succeed(`Dependencies installed!`);
}

/**
 * Clone the repo, copy the files from the repo to the new project directory, and delete the repo
 * @param {string} lang - The language of the template
 * @param {string} name - The name of the project
 */
export async function cloneRepo(lang, name) {
	await execa('git', [
		'clone',
		`https://github.com/sern-handler/templates.git`,
	]);
	copyRecursiveSync(`templates/templates/${lang}`, name);
	fs.rmSync(`templates/`, { recursive: true, force: true });
}

/**
 * If the source is a directory, create the destination directory and then recursively copy the
 * contents of the source directory to the destination directory. If the source is not a directory,
 * copy the source file to the destination file
 * @param {string} src - The source path.
 * @param {string} dest - The destination folder where the files will be copied to.
 */
export function copyRecursiveSync(src, dest) {
	const exists = fs.existsSync(src);

	const stats = exists && fs.statSync(src);

	const isDirectory = exists && stats.isDirectory();
	if (isDirectory) {
		fs.mkdirSync(dest);

		fs.readdirSync(src).forEach(function (childItemName) {
			copyRecursiveSync(
				path.join(src, childItemName),
				path.join(dest, childItemName)
			);
		});
	} else {
		fs.copyFileSync(src, dest);
	}
}

// async function wait(ms) {
// 	const wait = (await import('util')).promisify(setTimeout);
// 	return wait(ms);
// }
