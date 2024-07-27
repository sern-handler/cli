import { findUp } from 'find-up';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert';


export async function getConfig(): Promise<SernConfig> {
    const sernLocation = await findUp('sern.config.json');
    assert(sernLocation, "Can't find sern.config.json");

    const output = JSON.parse(await readFile(sernLocation, 'utf8')) as SernConfig;

    assert(output, "Can't read your sern.config.json.");

    return output;
}
export interface SernConfig {
    language: 'typescript' | 'javascript';
    defaultPrefix?: string;
    paths: {
        base: string;
        commands: string;
        events?: string;
    };
    build?: {

    }
}
