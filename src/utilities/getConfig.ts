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
    app?: {
        customInstallUrl?: string;
        description?: string;
        roleConnectionsVerificationUrl?: string;
        installParams?: {
            type: 'install params object';
        };
        integrationTypesConfig?: {
            type: 'dictionary with keys of application integration types';
            description: 'In preview. Default scopes and permissions for each supported installation context. Value for each key is an integration type configuration object';
        };
        flags?: number;
        icon?: '?image data';
        coverImage?: '?image data';
        interactionsEndpointUrl?: string;
        tags: string[];
    }
}
