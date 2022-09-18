import { bgYellow, green, redBright } from 'colorette';
import { execa } from 'execa';
import { findUp } from 'find-up';
import fs from 'fs';
import { readFile } from 'fs/promises';
import ora from 'ora';
import path from 'path';
import type { PackageManagerChoice } from './types';
import * as zl from 'zip-lib'
import Downloader from 'nodejs-file-downloader';

/**
 * It installs dependencies from a package.json file
 * @param choice - The package manager to use.
 * @param name - The name of the project
 */
export async function installDeps(choice: PackageManagerChoice, name: string) {
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
 * @param lang - The language of the template
 * @param name - The name of the project
 */
export async function cloneRepo(lang: string, name: string) {
	try {
		await execa('git', [
			'clone',
			`https://github.com/sern-handler/templates.git`,
		]);
		copyRecursiveSync(`templates/templates/${lang}`, name);
		fs.rmSync(`templates/`, { recursive: true, force: true });
	} catch (error) {
		console.log(`${bgYellow('⚠ WARN')} Git not installed, so I'll try using a fallback way of downloading the template...`)
		const downloader = new Downloader({
			url: "https://github.com/sern-handler/templates/archive/refs/heads/main.zip",
			directory: "."
		});
		try {
			await downloader.download();
		} catch (error) {
			console.log(error);
		}
		console.log(`${green('√')} File downloaded, unzipping...`);
		await zl.extract("./templates-main.zip", "./templates").then(function () {
			console.log(`${green('√')} Unzipped succesfully!`);
		}, function (err) {
			console.log(`${redBright('Failed')} to unzip the template! ${err}`);
			process.exit(1)
		});
		copyRecursiveSync(`./templates/templates-main/templates/${lang}`, `./${name}`);
		fs.rmSync(`./templates/`, { recursive: true, force: true });
	}
}

/**
 * If the source is a directory, create the destination directory and then recursively copy the
 * contents of the source directory to the destination directory. If the source is not a directory,
 * copy the source file to the destination file
 * @param src - The source path.
 * @param dest - The destination folder where the files will be copied to.
 */
export function copyRecursiveSync(src: string, dest: string) {
	const exists = fs.existsSync(src);

	const stats = (exists && fs.statSync(src)) as fs.Stats;

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
