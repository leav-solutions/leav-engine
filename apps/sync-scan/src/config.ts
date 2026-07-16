import {loadConfig} from '@leav/config-manager';
import * as Joi from 'joi';
import {type IConfig} from './_types/config';
import {env as appEnv} from './env';
import path from 'node:path';

const checkConfig = (conf: IConfig) => {
    const configSchema: Joi.ObjectSchema = Joi.object().keys({
        allowFilesList: Joi.string().required().allow(''),
        ignoreFilesList: Joi.string().required().allow(''),
        graphql: Joi.object()
            .keys({
                uri: Joi.string().required(),
                apiKey: Joi.string().required(),
                treeId: Joi.string().required(),
            })
            .required(),
        filesystem: Joi.object()
            .keys({
                absolutePath: Joi.string().required(),
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
                        password: Joi.string().required(),
                    })
                    .required(),
                exchange: Joi.string().required(),
                type: Joi.string().required(),
                routingKey: Joi.string().required(),
                rootKey: Joi.string().required(),
                prefetch: Joi.number(),
                queue: Joi.string(),
            })
            .required(),
        env: Joi.string().required(),
    });

    const isValid: Joi.ValidationResult<IConfig> = configSchema.validate(conf);

    if (isValid.error) {
        const errorMsg: string = isValid.error.details.map(e => e.message).join(', ');
        throw new Error(errorMsg);
    }
};

let loadedConfig: IConfig;
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
    if (loadedConfig !== undefined) {
        return loadedConfig;
    }
    const definedEnv: string = appEnv || '';

    const conf = await loadConfig<IConfig>(path.join(__dirname, '../config'), definedEnv);

    checkConfig(conf);
    loadedConfig = conf;
    return conf;
};
