import path from 'path';


/**
 * @param {any[]} dir
 */
export function fromCwd(...dir) {
	return path.join(process.cwd(), ...dir)
}

