/**
 * Load appropriate config based on application environment.
 * We first load default config, then env specified config (production, development...).
 * Finally, config can be overridden locally with "local.js" config file
 *
 * If one of these files is missing, it will be silently ignored.
 *
 * @return {Promise} Full config
 */
export declare function loadConfig<T extends {} = {}>(dirPath: string, env: string): Promise<T>;
//# sourceMappingURL=index.d.ts.map