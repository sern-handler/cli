import path from 'path';

export function fromCwd(...dir: string[]) {
	return path.join(...[process.cwd(), ...dir]);
}
