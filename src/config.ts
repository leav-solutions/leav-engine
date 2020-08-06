import {loadConfig} from '@casolutions/config-manager';
import * as Joi from '@hapi/joi';
import * as rootPath from 'app-root-path';
import * as Config from '_types/config';
import {env as appEnv} from './env';

const checkConfig = (conf: Config.IConfig) => {
    const configSchema = Joi.object().keys({
        server: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.number().required()
        }),
        db: Joi.object().keys({
            url: Joi.string().required(),
            name: Joi.string().required()
        }),
        elasticsearch: Joi.object().keys({
            url: Joi.string().required()
        }),
        auth: Joi.object().keys({
            scheme: Joi.string().required(),
            key: Joi.string(),
            algorithm: Joi.string().required(),
            tokenExpiration: Joi.string().required()
        }),
        lang: Joi.object().keys({
            available: Joi.array()
                .items(Joi.string())
                .required(),
            default: Joi.string().required()
        }),
        logs: Joi.object().keys({
            level: Joi.string().required(),
            transport: Joi.array()
                .items(Joi.string())
                .required(),
            destinationFile: Joi.string().required()
        }),
        permissions: Joi.object().keys({
            default: Joi.boolean().required()
        }),
        amqp: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.number().required(),
            user: Joi.string().required(),
            password: Joi.string().required(),
            exchange: Joi.string().required(),
            type: Joi.string().required()
        }),
        filesManager: Joi.object().keys({
            queues: Joi.object().keys({
                filesEvents: Joi.string().required(),
                previewRequest: Joi.string().required(),
                previewResponse: Joi.string().required()
            }),
            userId: Joi.number().required(),
            prefetch: Joi.number()
        }),
        indexationManager: Joi.object().keys({
            queue: Joi.string().required(),
            prefetch: Joi.number()
        }),
        debug: Joi.boolean(),
        env: Joi.string()
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
export const getConfig = async (): Promise<Config.IConfig> => {
    const definedEnv: string = appEnv || '';
    const conf = await loadConfig<Config.IConfig>(rootPath.path + '/config', definedEnv);

    checkConfig(conf);

    return conf;
};
