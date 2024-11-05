// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import {z} from 'zod';

export const configSchema = z
    .object({
        coreUrl: z.string(),
        auth: z
            .object({
                login: z.string(),
                password: z.string()
            })
            .required()
    })
    .required();

export type Config = z.infer<typeof configSchema>;

export const getConfig = async () => {
    const definedEnv: string = process.env.NODE_ENV ?? 'development';
    const confRootFolder = appRootPath();
    const confFolder = confRootFolder + '/config';

    const conf = await loadConfig<Config>(confFolder, definedEnv);
    configSchema.parse(conf);

    return conf;
};
