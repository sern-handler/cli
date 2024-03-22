import type esbuild from 'esbuild';
import { resolve } from 'path';

export default (format: 'cjs' | 'esm', tsconfig: string|undefined, outdir='dist') =>
    ({
        platform: 'node',
        format,
        tsconfig: tsconfig,
        logLevel: 'info',
        minify: false,
        outdir: resolve(outdir),
    } satisfies esbuild.BuildOptions);
