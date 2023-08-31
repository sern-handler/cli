import { readdirSync } from 'node:fs';
import { fromCwd } from './fromCwd';
import { redBright, cyanBright } from 'colorette';

export function getSern() {
    let files: string[] = [];

    try {
        const sern = fromCwd('.sern');
        files = readdirSync(sern);
    } catch (error) {
        console.error(`${redBright('Error:')} Could not locate ${cyanBright('.sern')} directory`);
        process.exit(1);
    } finally {
        return files;
    }
}
