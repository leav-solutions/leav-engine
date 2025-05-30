// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import Joi from 'joi';
import {CoreMode, IConfig} from './_types/config';
import {env as appEnv} from './env';

export const validateConfig = (conf: IConfig) => {
    const configSchema = Joi.object().keys({
        server: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.number().required(),
            publicUrl: Joi.string().required(),
            wsUrl: Joi.string().required(),
            uploadLimit: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
            supportEmail: Joi.string().required(),
            allowIntrospection: Joi.boolean().required(),
            admin: {
                login: Joi.string().required(),
                password: Joi.string().required(),
                email: Joi.string().email().required()
            },
            systemUser: {
                email: Joi.string().email().required()
            }
        }),
        coreMode: Joi.string()
            .valid(...Object.values(CoreMode))
            .required(),
        db: Joi.object().keys({
            url: Joi.string().required(),
            name: Joi.string().required()
        }),
        diskCache: Joi.object().keys({
            directory: Joi.string().required()
        }),
        auth: Joi.object().keys({
            scheme: Joi.string().required(),
            key: Joi.string(),
            algorithm: Joi.string().required(),
            tokenExpiration: Joi.string().required(),
            refreshTokenExpiration: Joi.string().required(),
            cookie: {
                sameSite: Joi.string().valid('none', 'lax', 'strict'),
                secure: Joi.boolean()
            },
            resetPasswordExpiration: Joi.string().required(),
            oidc: Joi.object().keys({
                enable: Joi.boolean().required(),
                wellKnownEndpoint: Joi.alternatives().conditional('enable', {
                    is: true,
                    then: Joi.string().required(),
                    otherwise: Joi.string()
                }),
                clientId: Joi.alternatives().conditional('enable', {
                    is: true,
                    then: Joi.string().required(),
                    otherwise: Joi.string()
                }),
                postLogoutRedirectUri: Joi.alternatives().conditional('enable', {
                    is: true,
                    then: Joi.string().required(),
                    otherwise: Joi.string()
                }),
                skipLogoutConfirmationPage: Joi.boolean(),
                idTokenUserClaim: Joi.string().required()
            }),
            testApiKey: Joi.string()
        }),
        mailer: Joi.object().keys({
            host: Joi.string(),
            port: Joi.number(),
            secure: Joi.boolean(),
            auth: {
                user: Joi.string().required(),
                password: Joi.string().required()
            }
        }),
        lang: Joi.object().keys({
            available: Joi.array().items(Joi.string()).required(),
            default: Joi.string().required()
        }),
        logs: Joi.object().keys({
            level: Joi.string().required(),
            transport: Joi.string().required(),
            destinationFile: Joi.string(),
            useJsonFormat: Joi.boolean()
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
            port: Joi.string().required(),
            database: Joi.number().required()
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
            rootKeys: Joi.object().keys({
                files1: Joi.string().required()
            }),
            userId: Joi.string().required(),
            userGroupsIds: Joi.string().required(),
            allowFilesList: Joi.string().required().allow(''),
            ignoreFilesList: Joi.string().required().allow('')
        }),
        indexationManager: Joi.object().keys({
            queues: Joi.object().keys({
                events: Joi.string().required()
            })
        }),
        tasksManager: Joi.object().keys({
            checkingInterval: Joi.number().required(),
            workerPrefetch: Joi.number().required(),
            restartWorker: Joi.boolean().required(),
            queues: Joi.object().keys({
                execOrders: Joi.string().required(),
                cancelOrders: Joi.string().required()
            }),
            routingKeys: Joi.object().keys({
                execOrders: Joi.string().required(),
                cancelOrders: Joi.string().required()
            })
        }),
        eventsManager: Joi.object().keys({
            routingKeys: Joi.object().keys({
                data_events: Joi.string().required(),
                pubsub_events: Joi.string().required()
            }),
            queues: Joi.object().keys({
                pubsub_events: Joi.string().required()
            })
        }),
        debug: Joi.boolean(),
        env: Joi.string(),
        defaultUserId: Joi.string().required(),
        export: Joi.object().keys({
            directory: Joi.string().required(),
            endpoint: Joi.string().required()
        }),
        import: Joi.object().keys({
            directory: Joi.string().required(),
            endpoint: Joi.string().required(),
            sizeLimit: Joi.number().required(),
            groupData: Joi.number().required(),
            maxStackedElements: Joi.number().required()
        }),
        plugins: Joi.object().keys().unknown(),
        preview: Joi.object().keys({
            directory: Joi.string().required()
        }),
        applications: Joi.object().keys({
            rootFolder: Joi.string().required()
        }),
        files: Joi.object().keys({
            rootPaths: Joi.string().required(),
            originalsPathPrefix: Joi.string().required()
        }),
        dbProfiler: Joi.object().keys({
            enable: Joi.boolean().required()
        }),
        instanceId: Joi.string().required(),
        elasticSearch: Joi.object().keys({
            url: Joi.string().required()
        }),
        pluginsPath: Joi.array().items(Joi.string()).required()
    });

    const isValid = configSchema.validate(conf);

    if (!!isValid.error) {
        const errorMsg = isValid.error.details.map(e => e.message).join(', ');
        throw new Error(errorMsg);
    }

    if (conf.env === 'production' && conf.auth.testApiKey) {
        console.warn('/!\\ Test API key is set in config, it should be removed in production /!\\');
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
export const getConfig = async (folder?: string) => {
    const definedEnv: string = appEnv;
    const confRootFolder = folder ?? appRootPath();
    const confFolder = confRootFolder + '/config';

    const conf = await loadConfig<IConfig>(confFolder, definedEnv);
    return conf;
};
