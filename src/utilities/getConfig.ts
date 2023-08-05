import assert from 'node:assert';
import type { sernConfig } from '../types/config.d.ts';
import { require } from '../utilities/require.js'
import { resolve } from 'node:path'
export async function getConfig(): Promise<sernConfig> {
    const sernObject = require(resolve('sern.config.json'));
    assert(sernObject, "Can't find sern.config.json");
    return sernObject;
}


