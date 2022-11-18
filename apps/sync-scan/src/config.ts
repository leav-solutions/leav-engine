// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import * as Joi from 'joi';
import {IConfig} from '_types/config';
import {env as appEnv} from './env';

const checkConfig = (conf: IConfig) => {
    const configSchema: Joi.ObjectSchema = Joi.object().keys({
        allowFilesList: Joi.string().required().allow(''),
        ignoreFilesList: Joi.string().required().allow(''),
        graphql: Joi.object()
            .keys({
                uri: Joi.string().required(),
                apiKey: Joi.string().required(),
                treeId: Joi.string().required()
            })
            .required(),
        filesystem: Joi.object()
            .keys({
                absolutePath: Joi.string().required()
            })
            .required(),
        amqp: Joi.object()
            .keys({
                connOpt: Joi.object()
                    .keys({
                        protocol: Joi.string().required(),
                        hostname: Joi.string().required(),
                        port: Joi.number().required(),
                        username: Joi.string().required(),
                        password: Joi.string().required()
                    })
                    .required(),
                exchange: Joi.string().required(),
                type: Joi.string().required(),
                routingKey: Joi.string().required(),
                rootKey: Joi.string().required(),
                prefetch: Joi.number(),
                queue: Joi.string()
            })
            .required(),
        env: Joi.string().required()
    });

    const isValid: Joi.ValidationResult<IConfig> = configSchema.validate(conf);

    if (isValid.error) {
        const errorMsg: string = isValid.error.details.map(e => e.message).join(', ');
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
export const getConfig = async (): Promise<IConfig> => {
    const definedEnv: string = appEnv || '';

    const conf = await loadConfig<IConfig>(appRootPath() + '/config', definedEnv);

    checkConfig(conf);

    return conf;
};
