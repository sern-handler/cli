import prompts from 'prompts';
import ora from 'ora';
import { greenBright, redBright, yellowBright } from 'colorette';
import { execa } from 'execa';
import { findUp } from 'find-up';
import {
	cmds_dir,
	lang,
	main_dir,
	gitInit,
	which_manager,
	skip_install_dep,
	name,
} from '../prompts/init.js';

import { npm } from '../utilities/npm.js';
import { cloneRepo, installDeps } from '../utilities/install.js';
import { editDirs, editMain } from '../utilities/edits.js';
import { writeFile } from 'fs/promises';
const { prompt } = prompts;

/**
 * @param {{ y: string; sync: string; }} flags
 */
export async function init(flags) {
	// * Check if node version is valid
	const { version } = process;
	const [ major, minor ] = version.split('.');
	const majorNum = parseInt(major.slice(1));
	const minorNum = parseInt(minor);
	
	if (majorNum < 16 || (majorNum === 16 && minorNum < 10)) {
		console.log(
			yellowBright(
				`\nYou are using Node ${version}\nPlease upgrade to Node 16.10.x or higher!\n`
			)
		);

		process.exit(1);
	}

	let data;
	let git_init;
	let pm;

	if (flags.y) {
		const projectName = await prompt([name]);
		git_init = true;
		pm = 'npm';
		data = {
			name: projectName.name,
			lang: 'typescript',
			main_dir: 'src',
			cmds_dir: 'commands',
		};
	} else if (flags.sync) {
		data = await prompt([lang, main_dir, cmds_dir]);
	} else {
		data = await prompt([name, lang, main_dir, cmds_dir]);
		git_init = (await prompt([gitInit])).gitinit;
		pm = await npm();
	}

	const config = {
		language: data.lang,
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

	if (pkg) {
		await writeFile(pkg.replace('package.json', 'sern.config.json'), file);
	}

	if (flags.sync) {
		console.log('Project was successfully synced!');
		process.exit(0);
	}

	git_init ? await git(data) : console.log(`Skipping git init...\n`);

	let choice;

	if (pm === 'both') {
		const chosen = await prompt([which_manager]);
		choice = chosen.manager;
	} else {
		const chosen = await prompt([skip_install_dep]);
		choice = chosen.skip_install_dep ? pm : 'skip';
	}

	await installDeps(choice, data.name);
	await editMain(data.name);
	await editDirs(data.main_dir, data.cmds_dir, data.name, data.lang);

	console.log(`${greenBright('Success, project was initialised!')}`);
	process.exit(0);
}

/**
 * It initializes git
 * @param data - The data object that contains the name of the project.
 */
async function git(data) {
	const spin = ora({
		text: 'Initializing git...',
		spinner: 'aesthetic',
	}).start();

	const exe = await execa('git', ['init', data.name]);

	await wait(300);

	if (!exe || exe?.failed) {
		spin.fail(
			`${redBright('Failed')} to initialize git!` +
				'\nMaybe you should run git init?'
		);
		process.exit(1);
	}

	spin.succeed('Git initialized!');
}

/**
 * Wait for a specified number of milliseconds, then return a promise that resolves to undefined.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns A function that takes a single argument, ms, and returns a promise that resolves after ms
 * milliseconds.
 */
async function wait(ms) {
	const wait = (await import('util')).promisify(setTimeout);
	return wait(ms);
}
