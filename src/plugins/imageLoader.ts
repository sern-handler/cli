import fs from 'fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { type Plugin } from 'esbuild'
import { } from '../utilities/getConfig'
import { basename } from 'node:path'

export const validExtensions = ['.ts','.js', '.json', '.png', '.jpg', '.jpeg', '.webp']

const require = createRequire(import.meta.url)
//https://github.com/evanw/esbuild/issues/1051
export const imageLoader = {
    name: 'attachment-loader',
    setup: b => {
        const filter = new RegExp(`\.${validExtensions.slice(3).join('|')}$`)
        b.onResolve({ filter }, args => {
            //if the module is being imported, resolve the path and transform to the js stub
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
