export interface PublishableData {
    name: string
    type: number,
    description: string
    absPath: string,
    options: Typeable[],
}
interface Typeable {
    type: number
}
export interface Config { 
    guildIds?: string[]
}
export interface PublishableModule {
    data: PublishableData,
    config: Config
}
