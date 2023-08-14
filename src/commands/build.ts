import esbuild from 'esbuild'
import { getConfig } from '../utilities/getConfig'
import { resolve } from 'node:path'
import { glob } from 'glob'
import { configDotenv } from 'dotenv'
import type { TheoreticalEnv } from '../types/config.d.ts'
import assert from 'node:assert'
import { imageLoader, validExtensions } from '../plugins/imageLoader'
import defaultEsbuild from '../utilities/defaultEsbuildConfig'

export async function build() {
    const sernConfig = await getConfig()
    let buildConfig: Partial<esbuild.BuildOptions>; 
    const entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`, {
                //for some reason, my ignore glob wasn't registering correctly'
                ignore: {
                    ignored: p => p.name.endsWith('.d.ts')
                }
            })
    if(sernConfig.buildPath) {
        try {
            buildConfig = (await import(resolve(sernConfig.buildPath))).default
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
    let tsconfig = buildConfig.tsconfig ? resolve(buildConfig.tsconfig) : undefined;
    let env = configDotenv({ debug: true }).parsed as TheoreticalEnv
    //I did not realize NODE_ENV was a thing. oops
    if(process.env.MODE && !process.env.NODE_ENV) {
        console.warn('It is recommended to use NODE_ENV instead of MODE');
        console.warn(`https://nodejs.dev/en/learn/nodejs-the-difference-between-development-and-production/`);
        console.warn('Will maintain no breaking changes. However, MODE will be removed in the next feature update as it is experimental')
    }
        
    let mode: string
    if(!process.env.NODE_ENV) {
        if(env.MODE === 'PROD') {
            mode = 'production' 
        } else {
            mode = 'development'
        }
    } else {
        mode = process.env.NODE_ENV; 
    }

    type BuildOptions = {
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
    }

    assert(mode === 'development' || mode === 'production', "Mode is not `production` or `development`"); 
    const defaultTsConfig = {
        compilerOptions: {
            target: "ESNext",
	    strict: true,
        }
    }
    tsconfig && console.log('Using default options for tsconfig', defaultTsConfig)

    try {
        //https://esbuild.github.io/content-types/#tsconfig-json
        await esbuild.build({ 
            ...buildConfig,
            plugins: [imageLoader, ...buildConfig.plugins??[] ],
            ...defaultEsbuild('esm'),
            tsconfigRaw: tsconfig === undefined ? JSON.stringify(defaultTsConfig) : undefined,
            tsconfig,
            define: {
                ...buildConfig.define ?? {},
                DEV: (mode === 'development').toString(),
                PROD:(mode === 'production').toString(),
            },
            dropLabels: [ mode === 'production' ? 'PROD' : 'DEV', ...buildConfig.dropLabels??[]],
        })
    } catch(e) {
        console.error(e)
        process.exit(1)
    }
    
}
