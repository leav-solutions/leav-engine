import path from 'node:path';
import {loadConfig} from '@leav/config-manager';
import {z} from 'zod';

export const configSchema = z
    .object({
        coreUrl: z.string(),
        auth: z
            .object({
                login: z.string(),
                password: z.string(),
            })
            .required(),
    })
    .required();

export type Config = z.infer<typeof configSchema>;

export const getConfig = async () => {
    const definedEnv: string = process.env.NODE_ENV ?? 'development';
    const confFolder = path.join(__dirname, '../config');

    const conf = await loadConfig<Config>(confFolder, definedEnv);
    configSchema.parse(conf);

    return conf;
};
