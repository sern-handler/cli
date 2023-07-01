import { findUp } from 'find-up';
import { getConfig } from '../utilities/getConfig';
import { fromCwd } from '../utilities/fromCwd';
import { spawn } from 'node:child_process'

export async function publish(fileName: string) {
	const { language, paths } = await getConfig();
	const ext = language === 'javascript' ? 'js' : 'ts';

	const path = await findUp(`${fileName}.${ext}`, {
		cwd: fromCwd(paths.base, paths.cmds_dir),
	});
        
       const command = spawn('node', [
           '--loader', '../loader.js',
           '../create-publish.js',
           fileName
       ])

       
        
}
