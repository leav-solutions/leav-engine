// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import Joi from 'joi';
import {IConfig} from '_types/config';
import {env as appEnv} from './env';

export const validateConfig = (conf: IConfig) => {
    const configSchema = Joi.object().keys({
        server: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.number().required(),
            publicUrl: Joi.string().required(),
            apiEndpoint: Joi.string().required(),
            uploadLimit: Joi.alternatives()
                .try(Joi.string(), Joi.number())
                .required()
        }),
        db: Joi.object().keys({
            url: Joi.string().required(),
            name: Joi.string().required()
        }),
        diskCache: Joi.object().keys({
            directory: Joi.string().required()
        }),
        elasticsearch: Joi.object().keys({
            url: Joi.string().required()
        }),
        auth: Joi.object().keys({
            scheme: Joi.string().required(),
            key: Joi.string(),
            algorithm: Joi.string().required(),
            tokenExpiration: Joi.string().required(),
            cookie: {
                sameSite: Joi.string().valid('none', 'lax', 'strict'),
                secure: Joi.boolean()
            }
        }),
        lang: Joi.object().keys({
            available: Joi.array()
                .items(Joi.string())
                .required(),
            default: Joi.string().required()
        }),
        logs: Joi.object().keys({
            level: Joi.string().required(),
            transport: Joi.string().required(),
            destinationFile: Joi.string()
        }),
        permissions: Joi.object().keys({
            default: Joi.boolean().required()
        }),
        amqp: Joi.object().keys({
            connOpt: Joi.object().keys({
                protocol: Joi.string().required(),
                hostname: Joi.string().required(),
                username: Joi.string().required(),
                password: Joi.string().required(),
                port: Joi.string().required()
            }),
            exchange: Joi.string().required(),
            type: Joi.string().required(),
            prefetch: Joi.number().required()
        }),
        redis: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.string().required()
        }),
        filesManager: Joi.object().keys({
            queues: Joi.object().keys({
                events: Joi.string().required(),
                previewRequest: Joi.string().required(),
                previewResponse: Joi.string().required()
            }),
            routingKeys: Joi.object().keys({
                events: Joi.string().required(),
                previewRequest: Joi.string().required(),
                previewResponse: Joi.string().required()
            }),
            rootKeysMapping: Joi.string().required(),
            userId: Joi.number().required()
        }),
        indexationManager: Joi.object().keys({
            queues: Joi.object().keys({
                events: Joi.string().required()
            })
        }),
        eventsManager: Joi.object().keys({
            routingKeys: Joi.object().keys({
                events: Joi.string().required()
            })
        }),
        debug: Joi.boolean(),
        env: Joi.string(),
        defaultUserId: Joi.string().required(),
        export: Joi.object().keys({
            directory: Joi.string().required()
        }),
        import: Joi.object().keys({
            directory: Joi.string().required(),
            sizeLimit: Joi.number().required(),
            groupData: Joi.number().required()
        }),
        plugins: Joi.object()
            .keys()
            .unknown(),
        preview: Joi.object().keys({
            directory: Joi.string().required()
        }),
        applications: Joi.object().keys({
            rootFolder: Joi.string().required()
        }),
        files: Joi.object().keys({
            rootPaths: Joi.string().required(),
            originalsPathPrefix: Joi.string().required()
        })
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
export const getConfig = async (folder?: string): Promise<any> => {
    const definedEnv: string = appEnv;
    const confRootFolder = folder ?? appRootPath();
    const confFolder = confRootFolder + '/config';

    const conf = await loadConfig<any>(confFolder, definedEnv);
    return conf;
};
