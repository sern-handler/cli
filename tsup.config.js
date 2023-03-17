import { defineConfig } from 'tsup'
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
const shared = {
    entry: ['src/index.ts'],
    platform: 'node',
    clean: true,
    sourcemap: true,
};
export default defineConfig(
    {
        format: 'esm',
        target: 'node16',
        tsconfig: './tsconfig.json',
        outDir: './dist',
        treeshake: true,
        esbuildPlugins: [esbuildPluginVersionInjector()],
        ...shared,
    }
)
