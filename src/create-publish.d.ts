export interface PublishableData {
    name: string
    type: number,
    description: string
    absPath: string,
    options: Typeable[],
}

export interface Config { 
    guildIds?: string[]
    
}
export interface PublishableModule {
    data: PublishableData,
    config: Config
}
