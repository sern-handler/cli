import esbuild, { type Plugin } from 'esbuild'
import { getConfig } from '../utilities/getConfig'
import { resolve } from 'node:path'
import { glob } from 'glob'
import { configDotenv } from 'dotenv'
import type { TheoreticalEnv } from '../types/config.d.ts'
import assert from 'node:assert'
import { validExtensions } from '../plugins/imageLoader'
import defaultEsbuild from '../utilities/defaultEsbuildConfig'

export async function build() {
    const config = await getConfig()
    let buildConfig: Partial<esbuild.BuildOptions>; 
    if(config.buildPath) {
        try {
            buildConfig = (await import(resolve(config.buildPath))).default
            if(buildConfig.entryPoints) {
                throw Error('Entry points are handled by sern.')
            }
            buildConfig.entryPoints = await glob(`./src/**/*{${validExtensions.join(',')}}`, {
                //for some reason, my ignore glob wasn't registering correctly'
                ignore: {
                    ignored: p => p.name.endsWith('.d.ts')
                }
            })

        } catch(e) {
            throw e;
        }
    } else {
        buildConfig = {
            entryPoints: await glob(`./src/**/*{${validExtensions.join(',')}}`, {
                //for some reason, my ignore glob wasn't registering correctly'
                ignore: {
                    ignored: p => p.name.endsWith('.d.ts')
                }
            })
        }
    }
    let tsconfig = buildConfig.tsconfig ? resolve(buildConfig.tsconfig) : undefined;
    let env = configDotenv({ debug: true }).parsed as TheoreticalEnv
    //I did not realize NODE_ENV was a thing. oops
    console.warn('It is recommended to use NODE_ENV instead of MODE (oopsies)');
    console.warn(`https://nodejs.dev/en/learn/nodejs-the-difference-between-development-and-production/`);
    console.warn('Will maintain no breaking changes. However, MODE will be removed in the next feature update as it is experimental')
    
    let mode: string
    if(!env.NODE_ENV) {
        if(env.MODE === 'PROD') {
            mode = 'production' 
        } else {
            mode = 'development'
        }
    } else {
        mode = env.NODE_ENV; 
    }
    assert(mode === 'development' || mode === 'production', "Mode is not `production` or `development`"); 
    console.log(...await glob(`./src/**/*.{${validExtensions.slice(3).join(',')}}`))

    try {
        await esbuild.build({ 
            ...buildConfig,
            ...defaultEsbuild,
            tsconfigRaw: tsconfig === undefined ? JSON.stringify({ 
               moduleResolution: "node",
	       resolveJsonModule: true,
	       target: "ESNext",
	       module: "ESNext",
	       outDir: "dist",
	       rootDir: "src",
               treeshake: true,
	       strict: true,
            }) : undefined,
            tsconfig,
            define: {
                DEV: (mode === 'development').toString(),
                PROD:(mode === 'production').toString(),
            },
            //external: ['discord.js', '@sern/handler',],
            dropLabels: [ mode === 'production' ? 'PROD' : 'DEV' ],
        })
    } catch(e) {
        console.error(e)
        process.exit(1)
    }
    
}
