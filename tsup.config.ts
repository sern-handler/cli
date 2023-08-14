import { defineConfig } from 'tsup';
import { createRequire } from 'node:module'
const shared = {
    entry: ['src/index.ts', 'src/create-publish.mts', 'src/commands/**', 'sern-tsconfig.json'],
    clean: true,
    sourcemap: true,
};
export default defineConfig({
    format: 'esm',
    target: 'node18',
    tsconfig: './tsconfig.json',
    outDir: './dist',
    treeshake: true,
    bundle: true,
    esbuildPlugins: [],
    platform: 'node',
    splitting: true,
    define: {
        __VERSION__: `"${createRequire(import.meta.url)('./package.json').version}"`
    },
    loader: {
        '.json': 'file'
    },
    ...shared,
});
