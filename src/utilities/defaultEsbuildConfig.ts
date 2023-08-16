import type esbuild from 'esbuild'
import { resolve } from 'path'

export default (format: 'cjs' | 'esm', tsconfigRaw: any) => ({
    platform: 'node',
    format,
    tsconfigRaw,
    logLevel: 'info',
    minify: false,
    outdir: resolve('dist'),

} satisfies esbuild.BuildOptions)
