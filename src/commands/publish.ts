import { findUp } from 'find-up';
import { getConfig } from '../utilities/getConfig';
import { fromCwd } from '../utilities/fromCwd';
import { readFileSync } from 'fs';

export async function publish(fileName: string) {
	const { language, paths } = await getConfig();
	const ext = language === 'javascript' ? 'js' : 'ts';

	const path = await findUp(`${fileName}.${ext}`, {
		cwd: fromCwd(paths.base, paths.cmds_dir),
	});

	if (!path) throw new Error(`Couldn't find ${fileName}.${ext}`);
	const contents = readFileSync(path, 'utf8');
}
