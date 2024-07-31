import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

interface CompilerOptions {
    target: string;
    module: string;
    lib: string[];
    allowJs: boolean;
    checkJs: boolean;
    jsx: string;
    declaration: boolean;
    sourceMap: boolean;
    outDir: string;
    rootDir: string;
    strict: boolean;
    esModuleInterop: boolean;
    forceConsistentCasingInFileNames: boolean;
    noEmit: boolean;
    importHelpers: boolean;
    isolatedModules: boolean;
    moduleResolution: string;
    resolveJsonModule: boolean;
    noEmitHelpers: boolean;
}

interface TsConfig {
    compilerOptions: CompilerOptions;
    files: string[];
    include: string[];
    exclude: string[];
    extends: string;
}

const cleanJson = (json: string) =>
    json
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//gm, '')
        .replace(/,\s*([}\]])/g, '$1');

export const parseTsConfig = async (path: string) => {
    const absPath = resolve(path);
    const fileContent = await readFile(absPath, 'utf-8');
    const cleanContent = cleanJson(fileContent);

    try {
        return JSON.parse(cleanContent) as Partial<TsConfig>;
    } catch (e) {
        return null;
    }
};
