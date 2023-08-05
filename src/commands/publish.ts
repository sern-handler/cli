import { getConfig } from '../utilities/getConfig';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'url';

export async function publish(fileName: string, args: any) {
    console.log(fileName)
    const config = await getConfig();
    // pass in args into the command.
    const root = new URL('../', import.meta.url);
    const src = new URL('./create-publish.js', root);
    const loader = new URL('./loader.js', root);
    const command = fork(fileURLToPath(src), [], {
        execArgv: ['--loader', loader.toString(), '--no-warnings'],
        env: {
            all: args?.all ? 'T' : 'F',
            pattern: fileName,
            token: args.token ?? "",
            applicationId: args.applicationId ?? ""
        },
    });
    //send paths object so we dont have to recalculate it in script
    command.send(config);
}
