import { bgYellowBright, greenBright, redBright } from 'colorette';
import { execa } from 'execa';
import { findUp } from 'find-up';
import fs from 'fs';
import { readFile, mkdir } from 'fs/promises';
import ora from 'ora';
import path from 'path';
import type { PackageManagerChoice } from './types';
import Downloader from 'nodejs-file-downloader'
import extract from 'extract-zip';
import fse from 'fs-extra'

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
		fse.copySync(`templates/templates/${lang}`, name);
		fs.rmSync(`templates/`, { recursive: true, force: true });
	} catch (error) {
		console.log(`${bgYellowBright('⚠ WARN')}: Can't clone templates with git, so using a fallback way.`)
		const downloader = new Downloader({url: 'https://github.com/sern-handler/templates/archive/refs/heads/main.zip', directory: '.'})
		try {
			await downloader.download()
			console.log(`${greenBright('√')} File downloaded successfully!`)
		} catch (error) {
			throw error
		}
		try {
			await extract('./templates-main.zip', { dir: path.resolve('./templates') })
		} catch (error) {
			throw error
		}
		fse.copySync(`templates/templates-main/templates/${lang}`, name);
		fs.rmSync(`templates/`, { recursive: true, force: true });
		fs.rmSync(`templates-main.zip`, { recursive: true, force: true });
	}
}
