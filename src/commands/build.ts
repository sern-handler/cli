import esbuild from 'esbuild';
import { getConfig } from '../utilities/getConfig';
import p from 'node:path';
import { glob } from 'glob';
import { configDotenv } from 'dotenv';
import assert from 'node:assert';
import defaultEsbuild from '../utilities/defaultEsbuildConfig';
import { require } from '../utilities/require';
import { pathExists, pathExistsSync } from 'find-up';
import { mkdir, writeFile } from 'fs/promises';
import * as Preprocessor from '../utilities/preprocessor';
import { bold, magentaBright } from 'colorette';
const validExtensions = ['.ts', '.js' ];
type BuildOptions = {
    /**
     * Define __VERSION__
     * This option is a quick switch to defining the __VERSION__ constant which will be a string of the version provided in
     * cwd's package.json
     */
    defineVersion?: boolean;
    /**
     * default = esm
     */
    format?: 'cjs' | 'esm';
    /**
     * extra esbuild plugins to build with sern.
     */
    esbuildPlugins?: esbuild.Plugin[];
    /**
     * https://esbuild.github.io/api/#drop-labels
     **/
    dropLabels?: string[];
    /**
     * https://esbuild.github.io/api/#define
     **/
    define?: Record<string, string>;

    tsconfig?: string;
    /**
     * default = 'development'
     */
    mode: 'production' | 'development';
    /**
     * will search for env file. If none exists,
     * default to .env.
     */
    env?: string;
};
const CommandHandlerPlugin = (commandPaths: Array<{name: string}>, eventsPaths: Array<{name: string}>) => {
    return {
        name: "commandhandler",
        setup(build) {
            build.onEnd(async result => {
               if(result.errors.length) return;
               const commandsImports = commandPaths.map((fname, i) => 
                   `import cm${i} from "./commands/${fname.name}"`);
               const eventImports = eventsPaths.map((fname, i) => 
                   `import em${i} from "./events/${fname.name}"`);
               const commandMapTemplate = 
                   'export const __commands = new Map();\n ' +
                   commandPaths.map((_, i) => `__commands.set(cm${i}.meta.id, cm${i});`).join("\n");
               const eventsMapTemplate =
                   'export const __events = new Map();\n' +
                   eventsPaths.map((_, i) => `__events.set(em${i}.meta.id, em${i});`).join("\n");

               const presence = await glob("./src/presence.{ts,js}");
               const startFile = 
                    commandsImports.join('\n') + '\n' +
                    eventImports.join('\n') + '\n' +
                    (presence.length ? `import p0 from './presence.js'` : '') + "\n" +
                    commandMapTemplate + "\n"+
                    eventsMapTemplate + "\n"; 
                await writeFile("./dist/handler.js", startFile);
            })
        }
    } as esbuild.Plugin
}
const resolveBuildConfig = (path: string|undefined, language: string) => {
    if(language === 'javascript') {
        return path ?? p.resolve('jsconfig.json')
    }
    return path ?? p.resolve('tsconfig.json')
}

export async function build(options: Record<string, any>) {
    if (!options.supressWarnings) {
        console.info(`${magentaBright('EXPERIMENTAL')}: This API has not been stabilized. add -W or --suppress-warnings flag to suppress`);
    }
    const sernConfig = await getConfig();
    let buildConfig: Partial<BuildOptions> = {};
    const buildConfigPath = p.resolve(options.project ?? 'sern.build.js');

    const defaultBuildConfig = {
        defineVersion: true,
        format: options.format ?? 'esm',
        mode: options.mode ?? 'development',
        dropLabels: [],
        tsconfig: resolveBuildConfig(options.tsconfig, sernConfig.language),
        env: options.env ?? p.resolve('.env'),
    };
    if (pathExistsSync(buildConfigPath)) {
        //throwable, buildConfigPath may not exist
        buildConfig = { ...defaultBuildConfig, ...(await import('file:///' + buildConfigPath)).default };
    } else {
        buildConfig = defaultBuildConfig;
        console.log('No build config found, defaulting');
    }
    let env = {} as Record<string, string>;
    configDotenv({ path: buildConfig.env, processEnv: env });
    const modeButNotNodeEnvExists = env.MODE && !env.NODE_ENV;
    if (modeButNotNodeEnvExists) {
        console.warn('Use NODE_ENV instead of MODE \n\
                      MODE has no effect. \n\
                      https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production'); 
    }

    if (env.NODE_ENV) {
        buildConfig.mode = env.NODE_ENV as 'production' | 'development';
        console.log(magentaBright('NODE_ENV:'), 'Found NODE_ENV variable, setting `mode` to this.');
    }

    assert(buildConfig.mode === 'development' || buildConfig.mode === 'production', 'Mode is not `production` or `development`');
    try {
        let config = require(buildConfig.tsconfig!);
        config.extends && console.warn("Extend the generated tsconfig")
    } catch(e) {
         console.error("no tsconfig / jsconfig found");
         console.error(`Please create a ${sernConfig.language === 'javascript' ? 'jsconfig.json' : 'tsconfig.json' }`);
         console.error('It should have at least extend the generated one sern makes.\n \
                        { "extends": "./.sern/tsconfig.json" }');
        throw e;
    }

    console.log(bold('Building with:'));
    console.log(' ', magentaBright('defineVersion'), buildConfig.defineVersion);
    console.log(' ', magentaBright('format'), buildConfig.format);
    console.log(' ', magentaBright('mode'), buildConfig.mode);
    console.log(' ', magentaBright('tsconfig'), buildConfig.tsconfig);
    console.log(' ', magentaBright('env'), buildConfig.env);

    const sernDir = p.resolve('.sern'),
          genDir = p.resolve(sernDir, 'generated'),
          ambientFilePath = p.resolve(sernDir, 'ambient.d.ts'),
          sernTsConfigPath = p.resolve(sernDir, 'tsconfig.json'),
          packageJson = () => require(p.resolve('package.json'));

    if (!(await pathExists(genDir))) {
        console.log('Making .sern/generated dir, does not exist');
        await mkdir(genDir, { recursive: true });
    }
    
    const entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`);
    const [commandsPaths, eventsPaths] = await Promise.all([
        glob(`**/*`, { 
            withFileTypes: true,
            ignore: { ignored: p => p.isDirectory() },
            cwd: "./src/commands/"
        }),
        glob(`**/*`, { 
            withFileTypes: true,
            ignore: { ignored: p => p.isDirectory() },
            cwd: "./src/events/"
        })
    ])
    
    const defVersion = () => JSON.stringify(packageJson().version);
    const define = {
        ...(buildConfig.define ?? {}),
        __DEV__: `${buildConfig.mode === 'development'}`,
        __PROD__: `${buildConfig.mode === 'production'}`,
        __VERSION__: `${buildConfig.defineVersion ? `${defVersion()}` : 'undefined'}`
    } satisfies Record<string, string>;

    await Preprocessor.writeTsConfig(buildConfig.format!, sernTsConfigPath, writeFile);
    await Preprocessor.writeAmbientFile(ambientFilePath, define, writeFile);

    //https://esbuild.github.io/content-types/#tsconfig-json
    await esbuild.build({
        entryPoints,
        plugins: [CommandHandlerPlugin(commandsPaths, eventsPaths)],
        ...defaultEsbuild(buildConfig.format!, buildConfig.tsconfig),
        define,
        dropLabels: [buildConfig.mode === 'production' ? '__DEV__' : '__PROD__', ...buildConfig.dropLabels!],
    });
}
