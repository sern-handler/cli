export type PackageManagerChoice = 'skip' | 'npm' | 'yarn';

export interface Config {
    language: string;
    paths : {
        base: string;
        commands: string;
    }

}
