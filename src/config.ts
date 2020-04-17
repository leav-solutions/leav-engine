import * as Joi from 'joi';
import * as rootPath from 'app-root-path';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from '_types/config';
import {env as appEnv} from './env';

/**
 * Load config file for given env
 */
const _getConfigByEnv = async function(env: string): Promise<Config | {}> {
    const envFile = path.resolve(path.join(rootPath.path, `/config/${env}.ts`));

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
 * Load appropriate config based on environment.
 * We first load default config, then env specified config (production, development...).
 * Finally, config can be overridden locally with "local.js" config file
 * If one of these files is missing, it will be silently ignored.
 */
const _getCombinedConfig = async (): Promise<Config> => {
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

    if (isValid.error !== null) {
        const errorMsg: string = isValid.error.details.map(e => e.message).join(', ');
        throw new Error(errorMsg);
    }
};

export default _getCombinedConfig();
