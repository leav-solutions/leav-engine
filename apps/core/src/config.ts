// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import Joi from 'joi';
import {CoreMode, type IConfig} from './_types/config';
import {env as appEnv} from './env';
import {logger} from '@leav/logger';
import {
    AdminPermissionsActions,
    ApplicationPermissionsActions,
    AttributeDependentValuesPermissionsActions,
    AttributePermissionsActions,
    LibraryPermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
    TreeNodePermissionsActions,
    TreePermissionsActions,
} from './_types/permissions';

export const validateConfig = (conf: IConfig) => {
    const permissionsByActionsSchema = (permissionActions: Record<string, string>) => {
        const schemaShape: Record<string, Joi.Schema> = {
            default: Joi.boolean(),
        };

        Object.values(permissionActions).forEach(action => {
            schemaShape[action] = Joi.boolean();
        });

        return Joi.object().keys(schemaShape);
    };

    const permissionsByTypeAndActions = Joi.object().keys({
        default: Joi.boolean().required(),
        [PermissionTypes.RECORD]: permissionsByActionsSchema(RecordPermissionsActions),
        [PermissionTypes.RECORD_ATTRIBUTE]: permissionsByActionsSchema(RecordAttributePermissionsActions),
        [PermissionTypes.ADMIN]: permissionsByActionsSchema(AdminPermissionsActions),
        [PermissionTypes.LIBRARY]: permissionsByActionsSchema(LibraryPermissionsActions),
        [PermissionTypes.ATTRIBUTE]: permissionsByActionsSchema(AttributePermissionsActions),
        [PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES]: permissionsByActionsSchema(
            AttributeDependentValuesPermissionsActions,
        ),
        [PermissionTypes.TREE]: permissionsByActionsSchema(TreePermissionsActions),
        [PermissionTypes.TREE_NODE]: permissionsByActionsSchema(TreeNodePermissionsActions),
        [PermissionTypes.TREE_LIBRARY]: permissionsByActionsSchema(TreeNodePermissionsActions),
        [PermissionTypes.APPLICATION]: permissionsByActionsSchema(ApplicationPermissionsActions),
    });

    const configSchema = Joi.object().keys({
        server: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.number().required(),
            keepAliveTimeout: Joi.number().required(),
            publicUrl: Joi.string().required(),
            basePath: Joi.string().required().allow(''),
            uploadLimit: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
            supportEmail: Joi.string().required(),
            allowIntrospection: Joi.boolean().required(),
            admin: {
                login: Joi.string().required(),
                password: Joi.string().required(),
                email: Joi.string().email().required(),
            },
            systemUser: {
                email: Joi.string().email().required(),
            },
            enableTracer: Joi.boolean().required(),
        }),
        coreMode: Joi.string()
            .valid(...Object.values(CoreMode))
            .required(),
        db: Joi.object().keys({
            url: Joi.string().required(),
            name: Joi.string().required(),
        }),
        diskCache: Joi.object().keys({
            directory: Joi.string().required(),
        }),
        dataLoaders: Joi.object().keys({
            valueRepo: Joi.object().keys({
                getValues: Joi.object().keys({
                    enableCache: Joi.boolean().required(),
                    useBatch: Joi.boolean().required(),
                }),
            }),
        }),
        auth: Joi.object().keys({
            scheme: Joi.string().required(),
            key: Joi.string(),
            algorithm: Joi.string().required(),
            tokenExpiration: Joi.string().required(),
            refreshTokenExpiration: Joi.string().required(),
            cookie: {
                sameSite: Joi.string().valid('none', 'lax', 'strict'),
                secure: Joi.boolean(),
                withDomain: Joi.boolean().required(),
            },
            resetPasswordExpiration: Joi.string().required(),
            oidc: Joi.object().keys({
                enable: Joi.boolean().required(),
                wellKnownEndpoint: Joi.alternatives().conditional('enable', {
                    is: true,
                    then: Joi.string().required(),
                    otherwise: Joi.string(),
                }),
                clientId: Joi.alternatives().conditional('enable', {
                    is: true,
                    then: Joi.string().required(),
                    otherwise: Joi.string(),
                }),
                postLogoutRedirectUri: Joi.alternatives().conditional('enable', {
                    is: true,
                    then: Joi.string().required(),
                    otherwise: Joi.string(),
                }),
                skipLogoutConfirmationPage: Joi.boolean(),
                idTokenUserClaim: Joi.string().required(),
                enableAutoProvisioning: Joi.alternatives().conditional('enable', {
                    is: true,
                    then: Joi.boolean().required(),
                    otherwise: Joi.boolean(),
                }),
                retryAuthenticationFlowAfterExpiry: Joi.boolean(),
                verificationKeysExpiration: Joi.string().required(),
            }),
            testApiKey: Joi.string(),
            debugLog: Joi.boolean(),
        }),
        mailer: Joi.object().keys({
            host: Joi.string(),
            port: Joi.number(),
            secure: Joi.boolean(),
            requireTLS: Joi.boolean(),
            from: Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
            }),
            auth: {
                user: Joi.string(),
                password: Joi.string(),
            },
        }),
        actions: Joi.object().keys({
            excel: {
                useNewHyperformula: Joi.boolean().required(),
                debug: Joi.boolean().required(),
            },
        }),
        lang: Joi.object().keys({
            available: Joi.array().items(Joi.string()).required(),
            default: Joi.string().required(),
        }),
        permissions: Joi.object().keys({
            everybody: permissionsByTypeAndActions.required(),
            adminGroup: permissionsByTypeAndActions.required(),
            enableCache: Joi.boolean().required(),
            enableAccessRecordByDefaultBackendFilter: Joi.boolean().required(),
            enableAttributeDependentValuesPermissions: Joi.boolean().required(),
        }),
        amqp: Joi.object().keys({
            connOpt: Joi.object().keys({
                protocol: Joi.string().required(),
                hostname: Joi.string().required(),
                username: Joi.string().required(),
                password: Joi.string().required(),
                port: Joi.string().required(),
            }),
            exchange: Joi.string().required(),
            type: Joi.string().required(),
            prefetch: Joi.number().required(),
        }),
        redis: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.string().required(),
            cacheDatabase: Joi.number().required(),
            sessionDatabase: Joi.number().required(),
        }),
        filesManager: Joi.object().keys({
            queues: Joi.object().keys({
                events: Joi.string().required(),
                previewRequest: Joi.string().required(),
                previewResponse: Joi.string().required(),
            }),
            routingKeys: Joi.object().keys({
                events: Joi.string().required(),
                previewRequest: Joi.string().required(),
                previewResponse: Joi.string().required(),
            }),
            rootKeys: Joi.object().keys({
                files1: Joi.string().required(),
            }),
            allowFilesList: Joi.string().required().allow(''),
            ignoreFilesList: Joi.string().required().allow(''),
        }),
        indexationManager: Joi.object().keys({
            queues: Joi.object().keys({
                events: Joi.string().required(),
            }),
        }),
        tasksManager: Joi.object().keys({
            checkingInterval: Joi.number().required(),
            workerPrefetch: Joi.number().required(),
            restartWorker: Joi.boolean().required(),
            queues: Joi.object().keys({
                execOrders: Joi.string().required(),
                cancelOrders: Joi.string().required(),
            }),
            routingKeys: Joi.object().keys({
                execOrders: Joi.string().required(),
                cancelOrders: Joi.string().required(),
            }),
        }),
        eventsManager: Joi.object().keys({
            routingKeys: Joi.object().keys({
                data_events: Joi.string().required(),
                pubsub_events: Joi.string().required(),
            }),
            queues: Joi.object().keys({
                pubsub_events_prefix: Joi.string().required(),
            }),
        }),
        debug: Joi.boolean(),
        env: Joi.string(),
        defaultUserId: Joi.string().required(),
        export: Joi.object().keys({
            directory: Joi.string().required(),
            endpoint: Joi.string().required(),
        }),
        import: Joi.object().keys({
            directory: Joi.string().required(),
            endpoint: Joi.string().required(),
            sizeLimit: Joi.number().required(),
            groupData: Joi.number().required(),
            maxStackedElements: Joi.number().required(),
            delayTaskExecMs: Joi.number().required(),
        }),
        plugins: Joi.object().keys().unknown(),
        preview: Joi.object().keys({
            directory: Joi.string().required(),
        }),
        applications: Joi.object().keys({
            rootFolder: Joi.string().required(),
        }),
        files: Joi.object().keys({
            rootPaths: Joi.string().required(),
            originalsPathPrefix: Joi.string().required(),
        }),
        dbProfiler: Joi.object().keys({
            enable: Joi.boolean().required(),
        }),
        instanceId: Joi.string().required(),
        elasticsearch: Joi.object().keys({
            indexPrefix: Joi.string().required(),
            url: Joi.string().required(),
            ilmPolicyName: Joi.string().required(),
            templateName: Joi.string().required(),
        }),
        logsCollector: Joi.object().keys({
            queue: Joi.string().required(),
        }),
        notification: Joi.object().keys({
            enable: Joi.boolean().required(),
            email: Joi.object().keys({
                enable: Joi.boolean().required(),
            }),
            webSocket: Joi.object().keys({
                enable: Joi.boolean().required(),
            }),
        }),
        pluginsPath: Joi.array().items(Joi.string()).required(),
        bugsnag: Joi.object().keys({
            enable: Joi.boolean().required(),
            apiKey: Joi.alternatives().conditional('enable', {
                is: true,
                then: Joi.string().required(),
                otherwise: Joi.string(),
            }),
            appVersion: Joi.alternatives().conditional('enable', {
                is: true,
                then: Joi.string().required(),
                otherwise: Joi.string(),
            }),
            appType: Joi.alternatives().conditional('enable', {
                is: true,
                then: Joi.string().required(),
                otherwise: Joi.string(),
            }),
            releaseStage: Joi.alternatives().conditional('enable', {
                is: true,
                then: Joi.string().required(),
                otherwise: Joi.string(),
            }),
        }),
        matomo: Joi.object().keys({
            enable: Joi.boolean().required(),
            url: Joi.alternatives().conditional('enable', {
                is: true,
                then: Joi.string().required(),
                otherwise: Joi.string().required().allow(''),
            }),
            siteId: Joi.alternatives().conditional('enable', {
                is: true,
                then: Joi.string().required(),
                otherwise: Joi.string().required().allow(''),
            }),
        }),
    });

    const isValid = configSchema.validate(conf);

    if (!!isValid.error) {
        const errorMsg = isValid.error.details.map(e => e.message).join(', ');
        throw new Error(errorMsg);
    }

    if (conf.env === 'production' && conf.auth.testApiKey) {
        logger.warn('/!\\ Test API key is set in config, it should be removed in production /!\\');
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

    return loadConfig<IConfig>(confFolder, definedEnv);
};
