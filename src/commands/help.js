import { cyanBright, yellowBright, green } from 'colorette';

export function help() {
	let guide = 'Welcome to Sern!\n';
	guide += `If you're new to ${cyanBright('Sern')}, run ${yellowBright(
		'sern init'
	)} for an interactive setup to your new bot project!\n\n`;
	guide += `${green(
		`If you have any ideas, suggestions, bug reports, kindly join our support server: https://discord.gg/xzK5fUKT4r`
	)}`;
	return guide;
}
