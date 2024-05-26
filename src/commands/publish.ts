import { magentaBright } from 'colorette';
import { getConfig } from '../utilities/getConfig';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'url';

export async function publish(commandDir: string | undefined, args: Partial<PublishArgs>) {
    if (!args.suppressWarnings) {
        console.info(`${magentaBright('EXPERIMENTAL')}: This API has not been stabilized. add -W or --suppress-warnings flag to suppress`);
    }
    const config = await getConfig();
    // pass in args into the command.
    const rootPath = new URL('../', import.meta.url),
        publishScript = new URL('../dist/create-publish.js', rootPath);
    // assign args.import to empty array if non existent
    args.import ??= [];

    commandDir && console.info('Publishing with override path: ', commandDir);

    const isBunOrPnpm = rootPath.pathname.includes('.bun') || rootPath.pathname.includes('.pnpm');

    const dotenvLocation = new URL(`${isBunOrPnpm ? '../../' : '../'}node_modules/dotenv/config.js`, rootPath),
        esmLoader = new URL(`${isBunOrPnpm ? '../../' : '../'}node_modules/@esbuild-kit/esm-loader/dist/index.js`, rootPath);

    // We dynamically load the create-publish script in a child process so that we can pass the special
    // loader flag to require typescript files
    const command = fork(fileURLToPath(publishScript), [], {
        execArgv: ['--loader', esmLoader.toString(), '-r', fileURLToPath(dotenvLocation), '--no-warnings'],
    });
    // send paths object so we dont have to recalculate it in script
    command.send({ config, preloads: args.import, commandDir });
}

interface PublishArgs {
    suppressWarnings: boolean;
    import: string[];
    token: string;
    applicationId: string;
}
