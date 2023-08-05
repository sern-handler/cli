import type esbuild from 'esbuild'
import { resolve } from 'path'
import { imageLoader } from '../plugins/imageLoader'
export default {
    platform: 'node',
    format: 'esm',
    logLevel: 'info',
    minify: false,
    outdir: resolve('dist'),
    plugins: [imageLoader]


} satisfies esbuild.BuildOptions
