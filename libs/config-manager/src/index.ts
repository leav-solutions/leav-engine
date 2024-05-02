// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as fs from 'fs';
import * as path from 'path';

interface IKeyValue<T> {
    [key: string]: any;
}

/**
 * Load config file for given env
 *
 * @param  {string}  dirPath
 * @param  {string}  env
 * @return {Promise<{}>}
 */
const _getConfigByEnv = async function <T extends object>(dirPath: string, env: string): Promise<T | {}> {
    const envFile = path.join(dirPath, `${env}.js`);

    if (env && (await fs.existsSync(envFile))) {
        const envConf = await import(envFile);

        return envConf.default;
    }

    return {};
};

const _isObject = (item: any): item is {} => item && typeof item === 'object' && !Array.isArray(item);

/**
 * Deep merge two objects.
 *
 * @param target
 * @param ...sources
 */
const _mergeDeep = function (target: IKeyValue<any>, ...sources: Array<IKeyValue<any>>): {} {
    if (!sources.length) {
        return target;
    }

    const source = sources.shift();

    if (_isObject(target) && _isObject(source)) {
        for (const key in source) {
            if (_isObject(source[key])) {
                if (!(target as IKeyValue<any>)[key]) {
                    Object.assign(target, {[key]: {}});
                }

                _mergeDeep((target as IKeyValue<any>)[key], source[key]);
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
export async function loadConfig<T extends {} = {}>(dirPath: string, env: string): Promise<T> {
    const merged = _mergeDeep(
        await _getConfigByEnv(dirPath, 'default'),
        await _getConfigByEnv(dirPath, env),
        await _getConfigByEnv(dirPath, 'local'),
        {
            env
        }
    );

    return merged as T;
}
