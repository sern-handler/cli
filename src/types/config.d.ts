export interface sernConfig {
    language: 'typescript' | 'javascript';
    paths: {
        base: string;
        commands: string;
    };
    buildPath: string;
    rest?: Record<string, Record<string,unknown>>;
}

export interface TheoreticalEnv {
    DISCORD_TOKEN: string
    APPLICATION_ID: string,
    MODE: 'PROD' | 'DEV'
    [name: string]: string
}


