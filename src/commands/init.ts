import { greenBright, redBright, underline } from 'colorette';
import { execa } from 'execa';
import { findUp } from 'find-up';
import ora from 'ora';
import prompt from 'prompts';
import {
	cmds_dir,
	gitInit,
	lang,
	main_dir,
	name,
	skip_install_dep,
	which_manager,
} from '../prompts/init.js';

import { writeFile } from 'fs/promises';
import { editDirs, editMain } from '../utilities/edits.js';
import { cloneRepo, installDeps } from '../utilities/install.js';
import { npm } from '../utilities/npm.js';
import type { PackageManagerChoice } from '../utilities/types.js';

export async function init(flags: Flags) {
	let data: PromptData;
	let git_init = true; // the default;
	let pm = flags.sync ? undefined : flags.y ? 'npm' : await npm();

	if (flags.y) {
		const projectName = await prompt([name]);
		git_init = true;
		data = {
			name: projectName.name,
			lang: 'typescript',
			main_dir: 'src',
			cmds_dir: 'commands',
		};
	} else if (flags.sync) {
		data = (await prompt([lang, main_dir, cmds_dir])) as PromptData;
	} else {
		data = (await prompt([name, lang, main_dir, cmds_dir])) as PromptData;
		git_init = (await prompt([gitInit])).gitinit;
	}

	const language = data.lang === 'javascript-esm' ? 'javascript' : data.lang;
	const config = {
		language,
		paths: {
			base: data.main_dir,
			commands: data.cmds_dir,
		},
	};
	const file = JSON.stringify(config, null, 2);

	const requiredData = flags.sync !== undefined ? 3 : 4;
	const receivedData = Object.keys(data).length;
	const incompleteDataCondition = receivedData < requiredData;

	if (incompleteDataCondition) process.exit(1);

	if (!flags.sync) await cloneRepo(data.lang, data.name);

	const pkg = await findUp('package.json', {
		cwd: process.cwd() + '/' + data.name,
	});

	if (!pkg) throw new Error('No package.json found!');

	await writeFile(pkg.replace('package.json', 'sern.config.json'), file);

	if (flags.sync) {
		console.log('Project was successfully synced!');
		process.exit(0);
	}

	git_init ? await git(data) : console.log(`Skipping git init...\n`);

	let choice: PackageManagerChoice;

	if (pm === 'all') {
		choice = (await prompt([which_manager])).manager;
	} else {
		choice = (
			(await prompt([skip_install_dep])).skip_install_dep ? pm : 'skip'
		) as PackageManagerChoice;
	}

	await installDeps(choice, data.name);
	await editMain(data.name);
	await editDirs(data.main_dir, data.cmds_dir, data.name, data.lang);

	console.log(`${greenBright('Success, project was initialised!')}`);
	process.exit(0);
}

/** It initializes git */
async function git(data: Data) {
	const spin = ora({
		text: 'Initializing git...',
		spinner: 'aesthetic',
	}).start();

	try {
		await execa('git', ['init', data.name]);
		await wait(300);
		spin.succeed('Git initialized!');
	} catch (error) {
		spin.fail(
			`${redBright(
				'Failed'
			)} to initialize git!\nTry to install it at ${underline(
				'https://git-scm.com'
			)}\nSkipping for now.`
		);
	}
}

/**  Wait for a specified number of milliseconds, then return a promise that resolves to undefined. */
async function wait(ms: number) {
	const wait = (await import('util')).promisify(setTimeout);
	return wait(ms);
}

interface Data {
	name: string;
}

interface Flags {
	y: boolean;
	sync: boolean;
}

interface PromptData {
	name: string;
	lang: 'typescript' | 'javascript' | 'javascript-esm';
	main_dir: string;
	cmds_dir: string;
}
