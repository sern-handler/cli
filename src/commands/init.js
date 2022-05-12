import prompts from 'prompts';
import ora from 'ora';
import { redBright, yellowBright } from 'colorette';
import { execa } from 'execa';
import {
	cmds_dir,
	default_prefix,
	lang,
	main_dir,
	gitInit,
	which_manager,
	name,
} from '../prompts/init.js';
import { npm } from '../utilities/npm.js';
import { cloneRepo, installDeps } from '../utilities/install.js';
import { editDirs, editMain } from '../utilities/edits.js';
const { prompt } = prompts;

export async function init({ flags }) {
	// * Check if node version is valid
	const node = await execa('node', ['--version']);
	if (/v1(([0-6]\.[2-9])|([0-5]\.[0-9]))/gm.test(node.stdout)) {
		console.log(
			yellowBright(
				`\nYou are using Node ${node.stdout}\nPlease upgrade to Node 16.10.x or higher!\n`
			)
		);

		process.exit(1);
	}

	let data;
	let git_init;
	let pm;

	if (flags?.includes('y')) {
		const projectName = await prompt([name]);
		git_init = true;
		pm = 'npm';
		data = {
			name: projectName.name,
			lang: 'typescript',
			main_dir: 'src',
			cmds_dir: 'commands',
			default_prefix: '!',
		};
	} else {
		data = await prompt([name, lang, main_dir, cmds_dir, default_prefix]);
		git_init = (await prompt([gitInit])).gitinit;
		await npm();
	}

	/**
	 * Initialize a new project, either with prompts or with default values.
	 * @param {boolean} isDefault - Whether or not to use default values.
	 */
	const initProject = async (isDefault) => {
		let data;

		if (!isDefault) {
			data = await prompt([
				name,
				lang,
				main_dir,
				cmds_dir,
				default_prefix,
			]);
		} else {
			const projectName = await prompt([name]);

<<<<<<< HEAD
			data = {
				name: projectName.name,
				lang: 'typescript',
				main_dir: 'src',
				cmds_dir: 'commands',
				default_prefix: '!',
			};
		}

		if (!isDefault && Object.keys(data).length < 5) process.exit(1);

		await cloneRepo(data.lang, data.name);

		git_init ? await git(data) : console.log(`Skipping git init...\n`);

		let choice = '';

		if (pm === 'both') {
			const chosen = await prompt([which_manager]);
			choice = chosen.manager;
		} else choice = pm;

		await installDeps(choice, data.name);
		await editMain(data.name);
		await editDirs(data.main_dir, data.cmds_dir, data.name);
	};

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

<<<<<<< HEAD
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
=======
	let pm;
	isDefault ? (pm = 'npm') : await npm();
=======
	git_init ? await git(data) : console.log(`Skipping git init...\n`);
>>>>>>> 4bca6db (refactor(init): cleaned up code and made a simple flow)

	let choice = '';

	if (pm === 'both') {
		const chosen = await prompt([which_manager]);
		choice = chosen.manager;
	} else choice = pm;

	await installDeps(choice, data.name);
	await editMain(data.name);
	await editDirs(data.main_dir, data.cmds_dir, data.name);
}

/**
 * It initializes git
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
>>>>>>> bf00a9f (refactor: remove unnecessary isDefault checks)
}
