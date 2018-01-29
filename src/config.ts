import * as fs from 'fs';
import {merge} from 'lodash';
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

    return merge(await _getConfigByEnv('default'), await _getConfigByEnv(definedEnv), await _getConfigByEnv('local'), {
        env: definedEnv
    });
};

export const config: {} = _getCombinedConfig();
