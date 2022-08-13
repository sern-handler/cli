import path from 'path';

/**
 * @param {string[]} dir
 */
export function fromCwd(...dir) {
	return path.join(...[process.cwd(), ...dir]);
}
