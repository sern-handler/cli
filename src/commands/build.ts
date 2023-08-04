import esbuild, { type Plugin } from 'esbuild'
import { getConfig } from '../utilities/getConfig'
import { resolve, basename } from 'node:path'
import { glob } from 'glob'
import { configDotenv } from 'dotenv'
import type { TheoreticalEnv } from '../types/config.d.ts'
import assert from 'node:assert'
import fs from 'fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
const validExtensions = ['.ts','.js', '.json', '.png', '.jpg', '.jpeg', '.webp']

const require = createRequire(import.meta.url)
//https://github.com/evanw/esbuild/issues/1051
export const imageLoader = {
    name: 'attachment-loader',
    setup: b => {
        const filter = new RegExp(`\.${validExtensions.slice(3).join('|')}$`)
        b.onResolve({ filter }, args => {
            //if the module is being imported, resolve the path and transform to js
            if(args.importer) {
               const newPath = path
                    .format({ ...path.parse(args.path), base: '', ext: '.js' })
                    .split(path.sep)
                    .join(path.posix.sep)
               return { path: newPath, namespace: 'attachment-loader', external: true }
            }
            // if the file is actually the attachment, resolve the full dir 
            return { path: require.resolve(args.path, { paths: [args.resolveDir] }), namespace: 'attachment-loader' }
        })       

        b.onLoad({ filter: /.*/, namespace: 'attachment-loader' },
            async (args) => {
                const base64 = await fs.readFile(args.path).then(s => s.toString('base64'))
                return {
                    contents: `
                    var __toBuffer = (base64) => Buffer.from(base64, "base64");
                    module.exports = {
                        name: '${basename(args.path)}',
                        attachment: __toBuffer("${base64}") 
                    }`,
                }
            })
    }
} satisfies Plugin

export async function build() {
    const config = await getConfig()
    let buildConfig: Partial<esbuild.BuildOptions>; 
    if(config.buildPath) {
        try {
            buildConfig = (await import(resolve(config.buildPath))).default
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

    const pkg = require(resolve('package.json'))
    try {
        await esbuild.build({ 
            ...buildConfig,
            platform: 'node',
            format: 'esm',
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
            logLevel: 'info',
            minify: false,
            define: {
                DEV: (mode === 'development').toString(),
                PROD:(mode === 'production').toString(),
            },
            loader: { 
                '.txt': 'default',
            },
            //external: ['discord.js', '@sern/handler',],
            dropLabels: [ mode === 'production' ? 'PROD' : 'DEV' ],
            outdir: resolve('dist'),

            plugins: [imageLoader]
        })
    } catch(e) {
        console.error(e)
        process.exit(1)
    }
    
}
