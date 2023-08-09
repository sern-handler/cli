import { readFile } from 'node:fs/promises';
import { findUp } from 'find-up';
import assert from 'node:assert';
export async function getConfig(): Promise<sernConfig> {
    const sernLocation = await findUp('sern.config.json');
    assert(sernLocation, "Can't find sern.config.json");

    const output = JSON.parse(await readFile(sernLocation, 'utf8')) as sernConfig;

    assert(output, "Can't read your sern.config.json.");

    return output;
}

export interface sernConfig {
    language: 'typescript' | 'javascript';
    defaultPrefix?: string;
    paths: {
        base: string;
        commands: string;
        events?: string;
    };
}
