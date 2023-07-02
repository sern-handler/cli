import { defineConfig } from 'tsup';
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
const shared = {
	entry: ['src/index.ts', 'src/create-publish.mts'],
	clean: true,
	sourcemap: true,
};
export default defineConfig({
	format: 'esm',
	target: 'node18',
	tsconfig: './tsconfig.json',
	outDir: './dist',
	treeshake: true,
	esbuildPlugins: [esbuildPluginVersionInjector()],
	platform: 'node',
	splitting: false,
	...shared,
});
