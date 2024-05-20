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
const CommandHandlerPlugin = (buildConfig: Partial<BuildOptions>, ambientFilePath: string, sernTsConfigPath: string) => {
    return {
        name: "commandhandler",
        setup(build) {

            const options = build.initialOptions

            const defVersion = () => JSON.stringify(require(p.resolve('package.json')).version);
            options.define = { 
                ...buildConfig.define ?? {},
                __DEV__: `${buildConfig.mode === 'development'}`,
                __PROD__: `${buildConfig.mode === 'production'}`,
                __VERSION__: `${buildConfig.defineVersion ? `${defVersion()}` : 'undefined'}`
            } ?? {} 
            Preprocessor.writeTsConfig(buildConfig.format!, sernTsConfigPath, writeFile);
            Preprocessor.writeAmbientFile(ambientFilePath, options.define!, writeFile);
            
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
    configDotenv({ path: buildConfig.env  });
    
    if (process.env.NODE_ENV) {
        buildConfig.mode = process.env.NODE_ENV as 'production' | 'development';
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
          [ambientFilePath, sernTsConfigPath, genDir] = 
          ['ambient.d.ts', 'tsconfig.json', 'generated'].map(f => p.resolve(sernDir, f));

    if (!(await pathExists(genDir))) {
        console.log('Making .sern/generated dir, does not exist');
        await mkdir(genDir, { recursive: true });
    }
    
    const entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`);
//  const [commandsPaths, eventsPaths] = await Promise.all([
//      glob(`**/*`, { withFileTypes: true, ignore: { ignored: p => p.isDirectory() }, cwd: "./src/commands/" }),
//      glob(`**/*`, { withFileTypes: true, ignore: { ignored: p => p.isDirectory() }, cwd: "./src/events/" })
//  ])

    //https://esbuild.github.io/content-types/#tsconfig-json
    const ctx = await esbuild.context({
        entryPoints,
        plugins: [CommandHandlerPlugin(buildConfig, ambientFilePath, sernTsConfigPath)],
        ...defaultEsbuild(buildConfig.format!, buildConfig.tsconfig),
        dropLabels: [buildConfig.mode === 'production' ? '__DEV__' : '__PROD__', ...buildConfig.dropLabels!],
    });

    await ctx.rebuild()
    if(options.watch) {
        await ctx.watch()
    } else {
        await ctx.dispose()
    }
}
