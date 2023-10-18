import type esbuild from 'esbuild';
import { resolve } from 'path';

export default (format: 'cjs' | 'esm', tsconfig: string|undefined) =>
    ({
        platform: 'node',
        format,
        tsconfig: tsconfig,
        logLevel: 'info',
        minify: false,
        outdir: resolve('dist'),
    } satisfies esbuild.BuildOptions);
