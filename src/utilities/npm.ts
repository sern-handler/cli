import { execa } from 'execa';

/**
 * It checks if you have npm, yarn, or pnpm installed, and returns a string based on the result
 * @returns A promise that resolves to a string.
 */
export async function npm() {
	const npm = await execa('npm', ['-v']).catch(() => null);
	const npm_version = npm?.stdout;

	const yarn = await execa('yarn', ['-v']).catch(() => null);
	const yarn_version = yarn?.stdout;

	const pnpm = await execa('pnpm', ['-v']).catch(() => null);
	const pnpm_version = pnpm?.stdout;

	if (npm_version && !yarn_version && !pnpm_version) {
		return 'npm';
	}

	if (yarn_version && !npm_version && !pnpm_version) {
		return 'yarn';
	}

	if (pnpm_version && !npm_version && !yarn_version) {
		return 'pnpm';
	}

	if (npm_version && yarn_version && pnpm_version) {
		return 'all';
	}
}
