import { findUp } from 'find-up';
import { getConfig } from '../utilities/getConfig';
import { fromCwd } from '../utilities/fromCwd';
import { fork } from 'node:child_process'

export async function publish(fileName: string) {
	const { language, paths } = await getConfig();
	const ext = language === 'javascript' ? 'js' : 'ts';

	const path = await findUp(`${fileName}.${ext}`, {
		cwd: fromCwd(paths.base, paths.cmds_dir),
	});
        
       // pass in args into the command.
       const command = fork(
           '../create-publish.js', 
           [ '--loader', '../loader.mjs'], { 
               env: {
                all: 'T',
                pattern: fileName
               } 
           })

       command.on('message', s => console.log(s.toString()))
        
}
