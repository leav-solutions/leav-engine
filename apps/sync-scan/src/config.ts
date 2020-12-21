import {loadConfig} from '@leav-engine/config-manager';
import * as rootPath from 'app-root-path';
import * as Joi from 'joi';
import {Config} from '_types/config';
import {env as appEnv} from './env';

const checkConfig = (conf: Config) => {
    const configSchema: Joi.ObjectSchema = Joi.object().keys({
        graphql: Joi.object()
            .keys({
                uri: Joi.string().required(),
                token: Joi.string().required(),
                treeId: Joi.string().required()
            })
            .required(),
        filesystem: Joi.object()
            .keys({
                absolutePath: Joi.string().required()
            })
            .required(),
        rmq: Joi.object()
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
                queue: Joi.string().required(),
                exchange: Joi.string().required(),
                routingKey: Joi.string().required(),
                rootKey: Joi.string().required(),
                type: Joi.string().required()
            })
            .required(),
        env: Joi.string().required()
    });

    const isValid: Joi.ValidationResult<Config> = configSchema.validate(conf);

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
export const getConfig = async (): Promise<Config> => {
    const definedEnv: string = appEnv || '';

    const conf = await loadConfig<Config>(rootPath.path + '/config', definedEnv);

    checkConfig(conf);

    return conf;
};
