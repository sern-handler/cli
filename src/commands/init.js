import { findUp } from 'find-up';
import prompts from 'prompts';
import ora from 'ora';
import { redBright, yellowBright } from 'colorette';
import { execa } from 'execa';
import {
	cmds_dir,
	default_prefix,
	intent,
	lang,
	main_dir,
	token,
	npmInit,
	gitInit,
} from '../prompts/init.js';
const { prompt } = prompts;

// TODO make this functional and better!
export async function init({ flags }) {
	if (flags?.includes('y')) {
		console.log("I see a flag there! Seems like you're lazy!\nBye!");
		process.exit(0);
	}
	const node = await execa('node', ['--version']);
	if ((/v1(([0-6]\.[2-9])|([0-5]\.[0-9]))/gm).test(node.stdout)) {
		console.log(
			yellowBright(
				`\nYou are using Node ${node.stdout}\nPlease upgrade to Node 16.10.x or higher!\n`
			)
		);
		return process.exit(1);
	}

	const pkg = await findUp('package.json');
	if (!pkg) {
		console.log(`No ${redBright('package.json')} found!`);
		const npm = await prompt([npmInit]);
		if (!npm.npminit) {
			console.log(
				`${redBright('Failed')} to initialize Sern!` +
					'\nMaybe you should run npm init?'
			);
			return process.exit(1);
		} else {
			const spin = ora({
				text: 'Initializing npm...',
				spinner: 'aesthetic',
			}).start();
			const exee = await execa('npm', ['init', '-y']).catch(
				() => null
			); /* .stdout.pipe(process.stdout) */
			await wait(300);
			if (!exee || exee?.failed) {
				spin.fail(
					`${redBright('Failed')} to initialize npm!` +
						'\nMaybe you should run npm init?'
				);
				return process.exit(1);
			} else spin.succeed('Npm initialized!');
		}
	}
	const git = await findUp('.git/config');
	if (!git) {
		console.log(`No ${redBright('Git Repository')} found!`);
		const git_init = await prompt([gitInit]);
		if (!git_init.gitinit) {
			console.log(
				'Maybe you should run git init?\n' + `Alright Moving on...`
			);
		} else {
			const spin = ora({
				text: 'Initializing git...',
				spinner: 'aesthetic',
			}).start();
			const exe = await execa('git', [
				'init',
			]); /* .stdout.pipe(process.stdout) */
			await wait(300);
			if (!exe || exe?.failed) {
				spin.fail(
					`${redBright('Failed')} to initialize git!` +
						'\nMaybe you should run git init?'
				);
				return process.exit(1);
			} else spin.succeed('Git initialized!');
			return;
		}
	}

	const data = await prompt([
		lang,
		main_dir,
		cmds_dir,
		default_prefix,
		token,
		intent,
	]);
	console.log(data);
}

/**
 * @param {number} ms
 */
async function wait(ms) {
	const wait = (await import('util')).promisify(setTimeout);
	return wait(ms);
}
