import { cyanBright, green, magentaBright } from 'colorette';

export const help = `
  ___  ___ _ __ _ __  
 / __|/ _ \\ '__| '_ \\ 
 \\__ \\  __/ |  | | | |
 |___/\\___|_|  |_| |_|

 Welcome!
 If you're new to ${cyanBright('sern')}, run ${magentaBright(
	'npm create @sern/bot'
)} for an interactive setup to your new bot project!

 ${green(
		`If you have any ideas, suggestions, bug reports, kindly join our support server: https://sern.dev/discord`
 )}`;
