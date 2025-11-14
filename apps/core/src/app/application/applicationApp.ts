// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import * as fs from 'fs';
import {type Override, type PublishedEvent} from '@leav/utils';
import {type ICommonSubscriptionFilters, type ICoreSubscriptionsHelpersApp} from 'app/core/helpers/subscriptions';
import {type IGraphqlAppModule, type IGraphqlApp} from 'app/graphql/graphqlApp';
import {type InitQueryContextFunc} from 'app/helpers/initQueryContext';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type IPermissionDomain} from 'domain/permission/permissionDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import express, {type NextFunction, type Response} from 'express';
import {type GraphQLResolveInfo} from 'graphql';
import {withFilter} from 'graphql-subscriptions';
import path from 'path';
import {type IUtils} from 'utils/utils';
import {type ILogger} from '@leav/logger';
import {type IGetCoreAttributesParams} from '_types/attribute';
import {type IRequestWithContext} from '_types/express';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IList} from '_types/list';
import {type IQueryInfos} from '_types/queryInfos';
import {type IKeyValue} from '_types/shared';
import {type IApplicationDomain} from '../../domain/application/applicationDomain';
import ApplicationError, {ApplicationErrorType} from '../../errors/ApplicationError';
import {
    ApplicationEventTypes,
    ApplicationTypes,
    APPS_URL_PREFIX,
    type IApplication,
    type IApplicationEvent,
    type IApplicationEventFilters,
    type IApplicationModule,
} from '../../_types/application';
import {TriggerNames} from '../../_types/eventsManager';
import {ApplicationPermissionsActions, PermissionTypes} from '../../_types/permissions';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {type ValidateRequestTokenFunc} from '../helpers/validateRequestToken';
import {type IAuthApp} from '../auth/authApp';
import {type IGlobalSettingsDomain} from '../../domain/globalSettings/globalSettingsDomain';
import {type IServerRouteAppModule} from 'interface/server';
import {type IConfig} from '_types/config';

export type IApplicationApp = IGraphqlAppModule & IServerRouteAppModule;

export interface IApplicationAppDeps {
    'core.app.graphql': IGraphqlApp;
    'core.app.auth': IAuthApp;
    'core.app.helpers.initQueryContext': InitQueryContextFunc;
    'core.app.helpers.validateRequestToken': ValidateRequestTokenFunc;
    'core.app.core.subscriptionsHelper': ICoreSubscriptionsHelpersApp;
    'core.domain.application': IApplicationDomain;
    'core.domain.permission': IPermissionDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.globalSettings': IGlobalSettingsDomain;
    'core.utils.logger': ILogger;
    'core.utils': IUtils;
    config: IConfig;
}

export default function ({
    'core.app.graphql': graphqlApp,
    'core.app.auth': authApp,
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.app.helpers.validateRequestToken': validateRequestToken,
    'core.app.core.subscriptionsHelper': subscriptionsHelper,
    'core.domain.application': applicationDomain,
    'core.domain.permission': permissionDomain,
    'core.domain.record': recordDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.domain.globalSettings': globalSettings,
    'core.utils.logger': logger,
    'core.utils': utils,
    config,
}: IApplicationAppDeps): IApplicationApp {
    const _doesFileExist = async (folder: string, filePath: string): Promise<boolean> => {
        try {
            await fs.promises.access(`${folder}${filePath}`);
            return true;
        } catch {
            return false;
        }
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                type ApplicationPermissions {
                    ${Object.values(ApplicationPermissionsActions)
                        .map(action => `${action}: Boolean!`)
                        .join(' ')}
                }

                enum ApplicationType {
                    ${Object.values(ApplicationTypes)
                        .map(type => `${type}`)
                        .join(' ')}
                }

                type Application {
                    id: ID!,
                    system: Boolean!,
                    type: ApplicationType!,
                    label(lang: [AvailableLanguage!]): SystemTranslation!,
                    description: SystemTranslation,
                    color: String,
                    icon: Record,
                    module: String,
                    endpoint: String,
                    url: String,
                    permissions: ApplicationPermissions!,
                    settings: JSONObject
                }

                type ApplicationModule {
                    id: ID!
                    description: String,
                    version: String
                }

                input ApplicationIconInput {
                    libraryId: String!,
                    recordId: String!
                }

                input ApplicationInput {
                    id: ID!
                    label: SystemTranslation,
                    type: ApplicationType,
                    description: SystemTranslationOptional,
                    color: String,
                    icon: ApplicationIconInput,
                    module: String,
                    endpoint: String,
                    settings: JSONObject
                }

                input ApplicationsFiltersInput {
                    id: ID,
                    label: String,
                    type: [ApplicationType],
                    system: Boolean,
                    endpoint: String,
                    module: String
                }

                type ApplicationsList {
                    totalCount: Int!,
                    list: [Application!]!
                }

                enum ApplicationSortableFields {
                    id
                    system
                    type
                    endpoint
                    module
                }

                input SortApplications {
                    field: ApplicationSortableFields!
                    order: SortOrder
                }

                enum ApplicationEventTypes {
                    ${Object.values(ApplicationEventTypes).join(' ')}
                }

                type ApplicationEvent {
                    type: ApplicationEventTypes!,
                    application: Application!
                }

                input ApplicationEventFiltersInput {
                    ${subscriptionsHelper.commonSubscriptionsFilters}

                    applicationId: ID,
                    events: [ApplicationEventTypes!]
                }

                extend type Query {
                    applications(
                        filters: ApplicationsFiltersInput,
                        pagination: Pagination,
                        sort: SortApplications
                    ): ApplicationsList
                    applicationsModules: [ApplicationModule!]!
                }

                extend type Mutation {
                    saveApplication(application: ApplicationInput!): Application!
                    deleteApplication(id: ID!): Application!
                }

                extend type Subscription {
                    applicationEvent(filters: ApplicationEventFiltersInput): ApplicationEvent!
                }
            `,
                resolvers: {
                    Query: {
                        async applications(
                            parent,
                            {filters, pagination, sort}: IGetCoreAttributesParams,
                            ctx: IQueryInfos,
                        ): Promise<IList<IApplication>> {
                            return applicationDomain.getApplications({
                                params: {filters, withCount: true, pagination, sort},
                                ctx,
                            });
                        },
                        async applicationsModules(_, args: {}, ctx: IQueryInfos): Promise<IApplicationModule[]> {
                            return applicationDomain.getAvailableModules({ctx});
                        },
                    },
                    Mutation: {
                        async saveApplication(
                            _,
                            {application}: {application: IApplication},
                            ctx,
                        ): Promise<IApplication> {
                            return applicationDomain.saveApplication({applicationData: application, ctx});
                        },
                        async deleteApplication(_, {id}, ctx): Promise<IApplication> {
                            return applicationDomain.deleteApplication({id, ctx});
                        },
                    },
                    Subscription: {
                        applicationEvent: {
                            subscribe: withFilter(
                                () => eventsManagerDomain.subscribe([TriggerNames.APPLICATION_EVENT]),
                                (
                                    event: PublishedEvent<{applicationEvent: IApplicationEvent}>,
                                    {filters}: {filters: ICommonSubscriptionFilters & IApplicationEventFilters},
                                    ctx: IQueryInfos,
                                ) => {
                                    if (filters?.ignoreOwnEvents && subscriptionsHelper.isOwnEvent(event, ctx)) {
                                        return false;
                                    }

                                    const {applicationEvent} = event;
                                    let mustReturn = true;
                                    if (filters?.applicationId) {
                                        mustReturn = applicationEvent.application.id === filters.applicationId;
                                    }

                                    if (mustReturn && filters?.events) {
                                        mustReturn = filters.events.includes(applicationEvent.type);
                                    }

                                    return mustReturn;
                                },
                            ),
                        },
                    },
                    Application: {
                        permissions: (
                            appData: IApplication,
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo,
                        ): Promise<IKeyValue<boolean>> => {
                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);
                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.APPLICATION,
                                    applyTo: appData.id,
                                    action: action as ApplicationPermissionsActions,
                                    ctx,
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        },
                        url: (appData: IApplication, _, ctx: IQueryInfos): string =>
                            applicationDomain.getApplicationUrl({application: appData, ctx}),
                        icon: async (
                            appData: Override<IApplication, {icon: {libraryId: string; recordId: string}}>,
                            _,
                            ctx: IQueryInfos,
                        ): Promise<IRecord | null> => {
                            if (!appData.icon) {
                                return null;
                            }
                            const record = await recordDomain.find({
                                params: {
                                    library: appData.icon.libraryId,
                                    filters: [
                                        {
                                            field: 'id',
                                            value: appData.icon.recordId,
                                            condition: AttributeCondition.EQUAL,
                                        },
                                    ],
                                },
                                ctx,
                            });

                            return record.list.length ? record.list[0] : null;
                        },
                    },
                },
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        registerRoute(app) {
            // Serve applications from their endpoint
            app.get(
                [`/${APPS_URL_PREFIX}/:endpoint`, `/${APPS_URL_PREFIX}/:endpoint/*`],
                // Check authentication and parse token
                async (req: IRequestWithContext, res: Response<unknown>, next: NextFunction) => {
                    const endpoint = req.params.endpoint;
                    req.ctx = initQueryContext(req);

                    if (endpoint === 'login' && config.auth.oidc.enable) {
                        const {defaultApp} = await globalSettings.getSettings({userId: config.defaultUserId});
                        return res.redirect(`${config.server.basePath}/${APPS_URL_PREFIX}/${defaultApp}/`);
                    }

                    const application = {id: '', module: ''};

                    if (['portal', 'login'].includes(endpoint)) {
                        application.id = endpoint;
                        application.module = endpoint;
                    } else {
                        const applications = await applicationDomain.getApplications({
                            params: {
                                filters: {
                                    endpoint,
                                },
                            },
                            ctx: req.ctx,
                        });

                        if (!applications.list.length) {
                            return next(new ApplicationError(ApplicationErrorType.UNKNOWN_APP_ERROR, endpoint));
                        }

                        const requestApplication = applications.list[0];
                        application.id = requestApplication.id;
                        application.module = requestApplication.module;
                    }

                    const rootPath = appRootPath();
                    const appFolder = path.resolve(rootPath, config.applications.rootFolder, application.module);

                    // Try to locate a file at given path. If not found, serve root path of the app,
                    // considering it will be handled it client-side (e.g. SPAs)
                    const newPath =
                        req.path.replace(new RegExp(`^\/${utils.getFullApplicationEndpoint(endpoint)}`), '') || '/';

                    const doesPathExists = await _doesFileExist(appFolder, newPath);
                    req.url = doesPathExists ? newPath : '/';
                    req.ctx.appFolder = appFolder;

                    if (endpoint === 'login') {
                        return next();
                    }

                    try {
                        if (doesPathExists && newPath !== '/') {
                            // Skip auth if we're serving an asset.
                            // We consider user is already authenticated if he's able to fetch an asset
                            return next();
                        }

                        const payload = await validateRequestToken(req, res);
                        req.ctx.userId = payload.userId;
                        req.ctx.groupsId = payload.groupsId;

                        const canAccess = await permissionDomain.isAllowed({
                            type: PermissionTypes.APPLICATION,
                            action: ApplicationPermissionsActions.ACCESS_APPLICATION,
                            applyTo: application.id,
                            ctx: req.ctx,
                        });

                        if (!canAccess) {
                            return next(new ApplicationError(ApplicationErrorType.FORBIDDEN_ERROR, endpoint));
                        }

                        return next();
                    } catch {
                        if (config.auth.oidc.enable) {
                            return authApp.authenticateWithOIDCService(req, res);
                        } else {
                            return res.redirect(
                                `${config.server.basePath}/${APPS_URL_PREFIX}/login/?dest=${encodeURIComponent(req.originalUrl)}`,
                            );
                        }
                    }
                },
                // Serve application
                async (req: IRequestWithContext, res: Response<unknown>, next: NextFunction) => {
                    try {
                        if (req.path === '/' || req.path === '/index.html') {
                            const applicationBaseUrl = `${config.server.basePath}/${utils.getFullApplicationEndpoint(req.params.endpoint)}`;
                            const indexContent = await fs.promises.readFile(`${req.ctx.appFolder}/index.html`, {
                                encoding: 'utf-8',
                            });
                            const modifiedIndex = indexContent
                                .replaceAll(/{{APPLICATION_BASE_URL}}/g, applicationBaseUrl)
                                .replaceAll(/{{GLOBAL_BASE_URL}}/g, config.server.basePath)
                                .replaceAll(
                                    /{{BUGSNAG_API_KEY}}/g,
                                    (config.bugsnag.enable && config.bugsnag.apiKey) || '',
                                )
                                .replaceAll(
                                    /{{BUGSNAG_APP_VERSION}}/g,
                                    (config.bugsnag.enable && config.bugsnag.appVersion) || '',
                                )
                                .replaceAll(
                                    /{{BUGSNAG_RELEASE_STAGE}}/g,
                                    (config.bugsnag.enable && config.bugsnag.releaseStage) || '',
                                )
                                .replaceAll(/{{MATOMO_URL}}/g, (config.matomo.enable && config.matomo.url) || '')
                                .replaceAll(
                                    /{{MATOMO_SITE_ID}}/g,
                                    (config.matomo.enable && config.matomo.siteId) || '',
                                );
                            res.send(modifiedIndex);
                            return next(); // needed to update consultation history
                        }

                        express.static(req.ctx.appFolder, {
                            extensions: ['html'],
                            fallthrough: false,
                        })(req, res, next);

                        return next();
                    } catch (e) {
                        return next(e);
                    }
                },
                async (req: IRequestWithContext) => {
                    try {
                        await applicationDomain.updateConsultationHistory({
                            applicationId: req.ctx.applicationId,
                            ctx: req.ctx,
                        });
                    } catch (err) {
                        logger.error(`Cannot update applications consultation history: ${err}`);
                    }
                },
                async (
                    err: undefined | ApplicationError | Error,
                    req: IRequestWithContext<unknown>,
                    res: Response<unknown>,
                    next: NextFunction,
                ) => {
                    const {defaultApp} = await globalSettings.getSettings({userId: config.defaultUserId});

                    if (err instanceof ApplicationError && err.appEndpoint !== defaultApp) {
                        res.redirect(
                            `${config.server.basePath}/${APPS_URL_PREFIX}/${defaultApp}/?err=${err.type}&app=${err.appEndpoint}`,
                        );
                    } else {
                        return next(err);
                    }
                },
            );

            app.get('/', async (req, res) => {
                const {defaultApp} = await globalSettings.getSettings({userId: config.defaultUserId});
                res.redirect(`${config.server.basePath}/${APPS_URL_PREFIX}/${defaultApp}/`);
            });
        },
    };
}
