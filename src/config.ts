import * as fs from 'fs';
import * as path from 'path';
import {env as appEnv} from './env';

/**
 * Load config file for given env
 *
 * @param  {string}  env
 * @return {Promise<{}>}
 */
const _getConfigByEnv = async function(env: string): Promise<{}> {
    const envFile = path.resolve(path.join(__dirname, `../config/${env}.js`));

    if (env && fs.existsSync(envFile)) {
        const envConf = await import(envFile);
        return envConf;
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
const _getCombinedConfig = async function(): Promise<{}> {
    const definedEnv: string = appEnv || '';

    const merged = _mergeDeep(
        await _getConfigByEnv('default'),
        await _getConfigByEnv(definedEnv),
        await _getConfigByEnv('local'),
        {
            env: definedEnv
        }
    );
    return merged;
};

export const config: {} = _getCombinedConfig();
