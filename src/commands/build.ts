import esbuild from 'esbuild'
import { getConfig } from '../utilities/getConfig'
import { resolve } from 'node:path'
import { glob } from 'glob'
import { configDotenv } from 'dotenv'
import assert from 'node:assert'
import { imageLoader, validExtensions } from '../plugins/imageLoader'
import defaultEsbuild from '../utilities/defaultEsbuildConfig'
import { require } from '../utilities/require'
import { pathExists, pathExistsSync } from 'find-up'
import { mkdir, writeFile } from 'fs/promises'
import * as Preprocessor  from '../utilities/preprocessor'
import { bold, magentaBright } from 'colorette'

type BuildOptions = {
    /**
      * Define __VERSION__
      * This option is a quick switch to defining the __VERSION__ constant which will be a string of the version provided in 
      * cwd's package.json
      */
    defineVersion?: boolean 
    /**
      * default = esm
      */
    format?: 'cjs' | 'esm'
    /** 
      * extra esbuild plugins to build with sern.
      */
    esbuildPlugins?: esbuild.Plugin[]
    /**
     * https://esbuild.github.io/api/#drop-labels
     **/
    dropLabels?: string[]
    /**
     * https://esbuild.github.io/api/#define
     **/
    define?: Record<string, string>

    tsconfig?: string;
    /**
      * default = 'development'
      */
    mode: 'production' | 'development',
    /**
      * will search for env file. If none exists, 
      * default to .env.
      */
    env?: string
}


export async function build(options: Record<string,any>) {
    if(!options.supressWarnings) {
        console.info(`${magentaBright('EXPERIMENTAL')}: This API has not been stabilized. add -W or --suppress-warnings flag to suppress`)
    }
    const sernConfig = await getConfig()
    let buildConfig: Partial<BuildOptions> = {}; 
    const entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`, {
                //for some reason, my ignore glob wasn't registering correctly'
                ignore: {
                    ignored: p => p.name.endsWith('.d.ts')
                }
            })
    const buildConfigPath = resolve(options.project ?? 'sern.build.js')
    

    const defaultBuildConfig = {
        defineVersion: true,
        format: options.format ?? 'esm',
        mode: options.mode ?? 'development',
        tsconfig: resolve('tsconfig.json'),
        env: resolve('.env')
    }
    if(pathExistsSync(buildConfigPath)) {
        try {
            buildConfig = {
                ...defaultBuildConfig,
                ...(await import('file:///'+buildConfigPath)).default,
            }
        } catch(e) {
            console.log(e)
            process.exit(1)
        }
    } else {
        buildConfig = {
            ...defaultBuildConfig
        }
        console.log('No build config found, defaulting')
    }
    let env = {} as Record<string,string>
    configDotenv({ path: defaultBuildConfig.env, processEnv: env })

    
    if(env.MODE && !env.NODE_ENV) {
        console.warn('Use NODE_ENV instead of MODE');
        console.warn('MODE has no effect.')
        console.warn(`https://nodejs.dev/en/learn/nodejs-the-difference-between-development-and-production/`);
    }
        
    if(env.NODE_ENV) {
       buildConfig.mode = env.NODE_ENV as 'production' | 'development'
       console.log(magentaBright('NODE_ENV:'), 'Found NODE_ENV variable, setting `mode` to this.')
    }
    assert(buildConfig.mode === 'development' || buildConfig.mode === 'production', "Mode is not `production` or `development`"); 

    const defaultTsConfig = {
        extends: "./.sern/tsconfig.json",
    }
    !buildConfig.tsconfig && console.log('Using default options for tsconfig', defaultTsConfig);
    const tsconfigRaw = require(buildConfig.tsconfig!);
    
    sernConfig.language === 'typescript' && tsconfigRaw && !tsconfigRaw.extends && (
        console.warn('tsconfig does not contain an "extends". Will not use sern automatic path aliasing'),
        console.warn('For projects that predate sern build and want to fully integrate, extend the tsconfig generated in .sern'),
        console.warn('Extend preexisting tsconfig with top level: "extends": "./.sern/tsconfig.json"')
    );
    console.log(bold('Building with:'))
    console.log(' ', magentaBright('defineVersion'), buildConfig.defineVersion)
    console.log(' ', magentaBright('format'), buildConfig.format)
    console.log(' ', magentaBright('mode'), buildConfig.mode)
    console.log(' ', magentaBright('tsconfig'), buildConfig.tsconfig)
    console.log(' ', magentaBright('env'), buildConfig.env)


    const sernDir = resolve('.sern'),
          genDir = resolve(sernDir, 'generated'),
          ambientFilePath = resolve(sernDir, 'ambient.d.ts'),
          packageJsonPath = resolve('package.json'),
          sernTsConfigPath = resolve(sernDir, 'tsconfig.json'),
          packageJson = () => require(packageJsonPath)


    if(!(await pathExists(genDir))) {
        console.log('Making .sern/generated dir, does not exist')
        await mkdir(genDir) 
    }
     
    try {
        const defVersion = () => JSON.stringify(packageJson().version)
        const define = {
                ...buildConfig.define ?? {},
                __DEV__: `${buildConfig.mode === 'development'}`,
                __PROD__: `${buildConfig.mode === 'production'}`,
        } satisfies Record<string, string>;

        buildConfig.defineVersion && Object.assign(define, { '__VERSION__': defVersion() });

        await Preprocessor.writeTsConfig(buildConfig.format!, sernTsConfigPath, writeFile);
        await Preprocessor.writeAmbientFile(ambientFilePath, define, writeFile);
        
        //https://esbuild.github.io/content-types/#tsconfig-json
        await esbuild.build({ 
            entryPoints,
            plugins: [imageLoader, ...buildConfig.esbuildPlugins??[] ],
            ...defaultEsbuild(buildConfig.format!, tsconfigRaw),
            define,
            dropLabels: [ buildConfig.mode === 'production' ? 'PROD' : 'DEV', ...buildConfig.dropLabels??[]],
        })
    } catch(e) {
        console.error(e)
        process.exit(1)
    }
}
