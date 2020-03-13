import * as Joi from '@hapi/joi';
import * as rootPath from 'app-root-path';
import * as fs from 'fs';
import * as path from 'path';
import * as Config from '_types/config';
import {env as appEnv} from './env';

/**
 * Load config file for given env
 *
 * @param  {string}  env
 * @return {Promise<IConfig | {}>}
 */
const _getConfigByEnv = async function(env: string): Promise<Config.IConfig | {}> {
    const envFile = path.resolve(path.join(rootPath.path, `/config/${env}.js`));

    if (env && fs.existsSync(envFile)) {
        const envConf = await import(envFile);

        return envConf.default;
    }

    return {};
};

const _isObject = item => {
    return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
const _mergeDeep = (target, ...sources) => {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();

    if (_isObject(target) && _isObject(source)) {
        for (const key in source) {
            if (_isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, {[key]: {}});
                }
                _mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return _mergeDeep(target, ...sources);
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
const _getCombinedConfig = async function(): Promise<Config.IConfig> {
    const definedEnv: string = appEnv || '';

    const merged = _mergeDeep(
        await _getConfigByEnv('default'),
        await _getConfigByEnv(definedEnv),
        await _getConfigByEnv('local'),
        {
            env: definedEnv
        }
    );

    checkConfig(merged);

    return merged;
};

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
        debug: Joi.boolean(),
        env: Joi.string()
    });

    const isValid = configSchema.validate(conf);

    if (isValid.error !== null) {
        const errorMsg = isValid.error.details.map(e => e.message).join(', ');
        throw new Error(errorMsg);
    }
};

export const config: Promise<Config.IConfig> = _getCombinedConfig();
