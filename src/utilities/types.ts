export type PackageManagerChoice = 'skip' | 'npm' | 'yarn';

export type GuildId = string;

export interface CommandData {
    id: string;
    application_id: string;
    version: string;
    default_member_permissions?: string;
    type: number;
    name: string;
    name_localizations?: Record<string, string>;
    description: string;
    description_localizations?: Record<string, string>;
    dm_permission: boolean;
    guild_id: string;
    nsfw: boolean;
    options?: OptionData[];
}

interface OptionData {
    type: number;
    name: string;
    name_localizations?: Record<string, string>;
    description: string;
    description_localizations?: Record<string, string>;
    required?: boolean;
    choices?: ChoiceData[];
    options?: OptionData[];
}

interface ChoiceData {
    name: string;
    value: string | number;
}
