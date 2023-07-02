import { getConfig } from '../utilities/getConfig';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'url';

export async function publish(fileName: any, args: any) {
    const { language, paths } = await getConfig();
    const ext = language === 'javascript' ? 'js' : 'ts';
	// pass in args into the command.
    const root = new URL('../', import.meta.url);
    const src = new URL('./dist/create-publish.js', root);
    const loader = new URL('./dist/loader.js', root);
    const command = fork(
	    fileURLToPath(src),
	    [ext],
	    {
                execArgv: [ '--loader', loader.toString(), '--no-warnings'],
		env: {
		    all: args.all ? 'T' : 'F',
		    pattern: fileName,
		},
	    }
    );
    //send paths object so we dont have to recalculate it in script
    command.send(paths)
}
