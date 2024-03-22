import esbuild from 'esbuild';
import { getConfig } from '../utilities/getConfig';
import p from 'node:path';
import { glob } from 'glob';
import { configDotenv } from 'dotenv';
import assert from 'node:assert';
import { imageLoader, validExtensions } from '../plugins/imageLoader';
import defaultEsbuild from '../utilities/defaultEsbuildConfig';
import { require } from '../utilities/require';
import { pathExists, pathExistsSync } from 'find-up';
import { mkdir, writeFile } from 'fs/promises';
import * as Preprocessor from '../utilities/preprocessor';
import { bold, magentaBright } from 'colorette';
import { readFile } from 'fs/promises'
import { fileURLToPath} from 'node:url'
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

export async function build(options: Record<string, any>) {
    if (!options.supressWarnings) {
        console.info(`${magentaBright('EXPERIMENTAL')}: This API has not been stabilized. add -W or --suppress-warnings flag to suppress`);
    }
    const sernConfig = await getConfig();
    let buildConfig: Partial<BuildOptions> = {};
    const buildConfigPath = p.resolve(options.project ?? 'sern.build.js');

    const resolveBuildConfig = (path: string|undefined, language: string) => {
       if(language === 'javascript') {
        return path ?? p.resolve('jsconfig.json')
       }
       return path ?? p.resolve('tsconfig.json')
    }

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
        buildConfig = {
            ...defaultBuildConfig,
            ...(await import('file:///' + buildConfigPath)).default,
        };
    } else {
        buildConfig = defaultBuildConfig;
        console.log('No build config found, defaulting');
    }
    let env = {} as Record<string, string>;
    configDotenv({ path: buildConfig.env, processEnv: env });
    const modeButNotNodeEnvExists = env.MODE && !env.NODE_ENV;
    if (modeButNotNodeEnvExists) {
        console.warn('Use NODE_ENV instead of MODE');
        console.warn('MODE has no effect.');
        console.warn(`https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production`);
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
         console.warn("no tsconfig / jsconfig found");
         console.warn(`Please create a ${sernConfig.language === 'javascript' ? 'jsconfig.json' : 'tsconfig.json' }`);
         console.warn("It should have at least extend the generated one sern makes.")
         console.warn(`
            { 
                "extends": "./.sern/tsconfig.json",
            }`.trim())
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
          packageJsonPath = p.resolve('package.json'),
          sernTsConfigPath = p.resolve(sernDir, 'tsconfig.json'),
          packageJson = () => require(packageJsonPath);

    if (!(await pathExists(genDir))) {
        console.log('Making .sern/generated dir, does not exist');
        await mkdir(genDir, { recursive: true });
    }
    if(sernConfig.type == 'serverless') {
        //we build for cloudflare workers rn
        const callsite = fileURLToPath(import.meta.url);
        const template = await readFile(p.resolve(callsite, "../../../templates/cf.js"), 'utf8');
        const entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`, {
            //for some reason, my ignore glob wasn't registering correctly'
            ignore: {
                ignored: (p) => { 
                    return p.name.endsWith('.d.ts')
                },
                childrenIgnored: p => p.isNamed('commands')
            },
        });
        const commandsPaths = await glob(`**/*`, { 
            ignore: {
                ignored: p => p.isDirectory()  
            },
            cwd: "./src/commands/"
        });
        console.log(entryPoints)
        console.log(commandsPaths)
        const commandsImports = commandsPaths.map(file => {
            const fname = p.parse(file)
            return `import ${fname.name} from "./${p.join(`./commands/${file}`).split(p.sep).join(p.posix.sep)}"`
        });
        console.log(commandsImports)
        await esbuild.build({
            entryPoints: commandsPaths.map(file => p.join("src", "commands", file)),
            plugins: [imageLoader, ...(buildConfig.esbuildPlugins ?? [])],
            ...defaultEsbuild(buildConfig.format!, buildConfig.tsconfig, "./dist/commands"),
            outdir: "./dist/commands",
            dropLabels: [buildConfig.mode === 'production' ? '__DEV__' : '__PROD__', ...buildConfig.dropLabels!],
        });
        //may need to invest in magicast for this lol
        const importedModulesTemplate = template
            .replace("\"use modules\";", commandsImports.join("\n"))
            .replace("\"use handle\";", `
                if(interaction.data.name === "${p.parse(commandsPaths.shift()!).name}") {
                    return;
                }
                ${commandsPaths.map(imp => {
                    return `else if(interaction.data.name === "${p.parse(imp).name}" ) { }`
                }).join("\n")}
            `);

        await writeFile("./dist/out.js", importedModulesTemplate);
    } else {


    const entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`, {
        //for some reason, my ignore glob wasn't registering correctly'
        ignore: {
            ignored: (p) => p.name.endsWith('.d.ts'),
        },
    });

    
    try {
        const defVersion = () => JSON.stringify(packageJson().version);
        const define = {
            ...(buildConfig.define ?? {}),
            __DEV__: `${buildConfig.mode === 'development'}`,
            __PROD__: `${buildConfig.mode === 'production'}`,
        } satisfies Record<string, string>;

        buildConfig.defineVersion && Object.assign(define, { __VERSION__: defVersion() });

        await Preprocessor.writeTsConfig(buildConfig.format!, sernTsConfigPath, writeFile);
        await Preprocessor.writeAmbientFile(ambientFilePath, define, writeFile);

        //https://esbuild.github.io/content-types/#tsconfig-json
        await esbuild.build({
            entryPoints,
            plugins: [imageLoader, ...(buildConfig.esbuildPlugins ?? [])],
            ...defaultEsbuild(buildConfig.format!, buildConfig.tsconfig),
            define,
            dropLabels: [buildConfig.mode === 'production' ? '__DEV__' : '__PROD__', ...buildConfig.dropLabels!],
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
    }
}
