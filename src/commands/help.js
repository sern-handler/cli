import { version } from '../utilities/version.js';

export function help({ flags }) {
	if (flags?.includes('v') || flags?.includes('version')) return version();
	console.log('This is the Sern CLI help section.\n\n' + 'Fill me up later!');
}
