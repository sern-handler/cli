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
import { magentaBright } from 'colorette'

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

    entryPoints?: string[]

    tsconfig?: string;
}


const getWorkingMode = (): string => {
    if(!process.env.NODE_ENV) {
        if(process.env.MODE === 'PROD') {
            return 'production' 
        } else {
            return 'development'
        }
    } 
    return process.env.NODE_ENV; 
    
}

export async function build(options: Record<string,boolean>) {
    if(!options.supressWarnings) {
        console.info(`${magentaBright('EXPERIMENTAL')}: This API has not been stabilized. add -W or --suppress-warnings flag to suppress`)
    }
    const sernConfig = await getConfig()
    let buildConfig: Partial<BuildOptions>; 
    const entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`, {
                //for some reason, my ignore glob wasn't registering correctly'
                ignore: {
                    ignored: p => p.name.endsWith('.d.ts')
                }
            })
    const buildConfigPath = resolve('sern.build.js')
    if(pathExistsSync(buildConfigPath)) {
        try {
            buildConfig = (await import('file:///'+buildConfigPath)).default
            if(buildConfig.entryPoints) {
                throw Error('Entry points are handled by sern.')
            }
            buildConfig.entryPoints = entryPoints
        } catch(e) {
            throw e;
        }
    } else {
        buildConfig = {
            entryPoints 
        }
    }
    let tsconfigPath = buildConfig.tsconfig ? resolve(buildConfig.tsconfig) : resolve('tsconfig.json');
    configDotenv({ debug: true }).parsed
    if(process.env.MODE && !process.env.NODE_ENV) {
        console.warn('It is recommended to use NODE_ENV instead of MODE');
        console.warn(`https://nodejs.dev/en/learn/nodejs-the-difference-between-development-and-production/`);
        console.warn('Will maintain no breaking changes. However, MODE will be removed in the next feature update as it is experimental')
    }
        
    const mode = getWorkingMode(),
          format = buildConfig.format ?? 'esm'

    assert(mode === 'development' || mode === 'production', "Mode is not `production` or `development`"); 
    const defaultTsConfig = {
        extends: "./.sern/tsconfig.json",
    }
    !tsconfigPath && console.log('Using default options for tsconfig', defaultTsConfig);
    const tsconfigRaw = tsconfigPath ? require(tsconfigPath) : defaultTsConfig;
    
    sernConfig.language === 'typescript' && tsconfigRaw && !tsconfigRaw.extends && (
        console.warn('tsconfig does not contain an "extends". Will not use sern automatic path aliasing'),
        console.warn('For projects that predate sern build and want to fully integrate, extend the tsconfig generated in .sern'),
        console.warn('Extend preexisting tsconfig with top level: "extends": "./.sern/tsconfig.json"')
    );
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
                __DEV__: `${mode === 'development'}`,
                __PROD__: `${mode === 'production'}`,
        } satisfies Record<string, string>;

        buildConfig.defineVersion && Object.assign(define, { '__VERSION__': defVersion() });

        await Preprocessor.writeTsConfig(format, sernTsConfigPath, writeFile);
        await Preprocessor.writeAmbientFile(ambientFilePath, define, writeFile);
        
        //https://esbuild.github.io/content-types/#tsconfig-json
        await esbuild.build({ 
            entryPoints: buildConfig.entryPoints,
            plugins: [imageLoader, ...buildConfig.esbuildPlugins??[] ],
            ...defaultEsbuild(format, tsconfigRaw),
            define,
            dropLabels: [ mode === 'production' ? 'PROD' : 'DEV', ...buildConfig.dropLabels??[]],
        })

    } catch(e) {
        console.error(e)
        process.exit(1)
    }
    
}
