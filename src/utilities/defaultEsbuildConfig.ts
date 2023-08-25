import type esbuild from 'esbuild'
import { resolve } from 'path'

export default (format: 'cjs' | 'esm', tsconfigRaw: unknown) => ({
    platform: 'node',
    format,
    tsconfigRaw: tsconfigRaw as esbuild.TsconfigRaw,
    logLevel: 'info',
    minify: false,
    outdir: resolve('dist'),

} satisfies esbuild.BuildOptions)
