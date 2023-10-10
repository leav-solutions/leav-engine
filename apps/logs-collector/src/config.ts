// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import Joi from 'joi';
import {IConfig} from '_types/config';

export const validateConfig = (conf: IConfig) => {
    const configSchema = Joi.object().keys({
        amqp: Joi.object().keys({
            protocol: Joi.string().required(),
            exchange: Joi.string().required(),
            hostname: Joi.string().required(),
            port: Joi.string().required(),
            username: Joi.string().required(),
            password: Joi.string().required(),
            type: Joi.string().required(),
            queue: Joi.string().required(),
            routingKey: Joi.string().required()
        }),
        debug: Joi.boolean().required()
    });

    const isValid = configSchema.validate(conf);

    if (!!isValid.error) {
        const errorMsg = isValid.error.details.map(e => e.message).join(', ');
        throw new Error(errorMsg);
    }
};

/**
 * Load appropriate config based on application environment.
 * We first load default config, then env specified config (production, development...).
 * Finally, config can be overridden locally with "local.js" config file
 *
 * If one of these files is missing, it will be silently ignored.
 *
 * @return {Promise} Full config
 */
export const getConfig = async (folder?: string) => {
    const definedEnv: string = process.env.NODE_ENV ?? 'production';
    const confRootFolder = folder ?? appRootPath();
    const confFolder = confRootFolder + '/config';

    const conf = await loadConfig<IConfig>(confFolder, definedEnv);
    return conf;
};
