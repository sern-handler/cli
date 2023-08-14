import type esbuild from 'esbuild'
import { resolve } from 'path'

export default (format: 'cjs' | 'esm') => ({
    platform: 'node',
    format,
    logLevel: 'info',
    minify: false,
    outdir: resolve('dist'),

} satisfies esbuild.BuildOptions)
