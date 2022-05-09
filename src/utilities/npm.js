import { execa } from 'execa';

/**
 * It checks if you have npm or yarn installed, and returns a string based on the result
 * @returns A promise that resolves to a string.
 */
export async function npm() {
	const npm = await execa('npm', ['-v']);
	const npm_version = npm?.stdout;
	const yarn = await execa('yarn', ['-v']);
	const yarn_version = yarn?.stdout;
	if (npm_version && !yarn_version) {
		return 'npm';
	}
	if (!npm_version && yarn_version) {
		return 'yarn';
	}
	if (npm_version && yarn_version) {
		return 'both';
	}
}
