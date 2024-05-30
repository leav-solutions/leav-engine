// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {Override, PublishedEvent} from '@leav/utils';
import {ICommonSubscriptionFilters, ICoreSubscriptionsHelpersApp} from 'app/core/helpers/subscriptions';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {InitQueryContextFunc} from 'app/helpers/initQueryContext';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IApplicationPermissionDomain} from 'domain/permission/applicationPermissionDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import express, {Express, NextFunction, Response} from 'express';
import glob from 'glob';
import {GraphQLResolveInfo} from 'graphql';
import {withFilter} from 'graphql-subscriptions';
import path from 'path';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IGetCoreAttributesParams} from '_types/attribute';
import {IRequestWithContext} from '_types/express';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {IApplicationDomain} from '../../domain/application/applicationDomain';
import ApplicationError, {ApplicationErrorType} from '../../errors/ApplicationError';
import {
    ApplicationEventTypes,
    ApplicationTypes,
    APPS_URL_PREFIX,
    IApplication,
    IApplicationEvent,
    IApplicationEventFilters,
    IApplicationModule
} from '../../_types/application';
import {TriggerNames} from '../../_types/eventsManager';
import {ApplicationPermissionsActions, PermissionTypes} from '../../_types/permissions';
import {AttributeCondition, IRecord} from '../../_types/record';
import {ValidateRequestTokenFunc} from '../helpers/validateRequestToken';
import {IAuthApp} from '../auth/authApp';

export interface IApplicationApp {
    registerRoute(app: Express): void;

    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.app.graphql'?: IGraphqlApp;
    'core.app.auth'?: IAuthApp;
    'core.app.helpers.initQueryContext'?: InitQueryContextFunc;
    'core.app.helpers.validateRequestToken'?: ValidateRequestTokenFunc;
    'core.app.core.subscriptionsHelper'?: ICoreSubscriptionsHelpersApp;
    'core.domain.application'?: IApplicationDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.permission.application'?: IApplicationPermissionDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
    config?: any;
}

export default function ({
    'core.app.graphql': graphqlApp = null,
    'core.app.auth': authApp = null,
    'core.app.helpers.initQueryContext': initQueryContext = null,
    'core.app.helpers.validateRequestToken': validateRequestToken = null,
    'core.app.core.subscriptionsHelper': subscriptionsHelper = null,
    'core.domain.application': applicationDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.domain.permission.application': applicationPermissionDomain = null,
    'core.domain.record': recordDomain,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.utils.logger': logger = null,
    'core.utils': utils = null,
    config = null
}: IDeps = {}): IApplicationApp {
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
                            ctx: IQueryInfos
                        ): Promise<IList<IApplication>> {
                            return applicationDomain.getApplications({
                                params: {filters, withCount: true, pagination, sort},
                                ctx
                            });
                        },
                        async applicationsModules(_, args: {}, ctx: IQueryInfos): Promise<IApplicationModule[]> {
                            return applicationDomain.getAvailableModules({ctx});
                        }
                    },
                    Mutation: {
                        async saveApplication(
                            _,
                            {application}: {application: IApplication},
                            ctx
                        ): Promise<IApplication> {
                            return applicationDomain.saveApplication({applicationData: application, ctx});
                        },
                        async deleteApplication(_, {id}, ctx): Promise<IApplication> {
                            return applicationDomain.deleteApplication({id, ctx});
                        }
                    },
                    Subscription: {
                        applicationEvent: {
                            subscribe: withFilter(
                                () => eventsManagerDomain.subscribe([TriggerNames.APPLICATION_EVENT]),
                                (
                                    event: PublishedEvent<{applicationEvent: IApplicationEvent}>,
                                    {filters}: {filters: ICommonSubscriptionFilters & IApplicationEventFilters},
                                    ctx: IQueryInfos
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
                                }
                            )
                        }
                    },
                    Application: {
                        permissions: (
                            appData: IApplication,
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo
                        ): Promise<IKeyValue<boolean>> => {
                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);
                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.APPLICATION,
                                    applyTo: appData.id,
                                    action: action as ApplicationPermissionsActions,
                                    userId: ctx.userId,
                                    ctx
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        },
                        url: (appData: IApplication, _, ctx: IQueryInfos): string =>
                            applicationDomain.getApplicationUrl({application: appData, ctx}),
                        icon: async (
                            appData: Override<IApplication, {icon: {libraryId: string; recordId: string}}>,
                            _,
                            ctx: IQueryInfos
                        ): Promise<IRecord> => {
                            if (!appData.icon) {
                                return null;
                            }
                            const record = await recordDomain.find({
                                params: {
                                    library: appData.icon.libraryId,
                                    filters: [
                                        {field: 'id', value: appData.icon.recordId, condition: AttributeCondition.EQUAL}
                                    ]
                                },
                                ctx
                            });

                            return record.list.length ? record.list[0] : null;
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        registerRoute(app): void {
            // Serve applications from their endpoint
            app.get(
                [`/${APPS_URL_PREFIX}/:endpoint`, `/${APPS_URL_PREFIX}/:endpoint/*`],
                // Check authentication and parse token
                async (req: IRequestWithContext, res: Response<unknown>, next: NextFunction) => {
                    const endpoint = req.params.endpoint;
                    req.ctx = initQueryContext(req);

                    if (endpoint === 'login') {
                        return next();
                    }

                    try {
                        const payload = await validateRequestToken(req);
                        req.ctx.userId = payload.userId;
                        req.ctx.groupsId = payload.groupsId;

                        return next();
                    } catch {
                        if (config.auth.oidc !== null) {
                            return authApp.authenticateWithOIDCService(req, res);
                        } else {
                            return res.redirect(`/${APPS_URL_PREFIX}/login/?dest=${req.originalUrl}`);
                        }
                    }
                },
                // Serve application
                async (req: IRequestWithContext, res: Response<unknown>, next: NextFunction) => {
                    // Get available applications
                    const {endpoint} = req.params;
                    const application = {id: '', module: ''};

                    if (['portal', 'login'].includes(endpoint)) {
                        application.id = endpoint;
                        application.module = endpoint;
                    } else {
                        const applications = await applicationDomain.getApplications({
                            params: {
                                filters: {
                                    endpoint
                                }
                            },
                            ctx: req.ctx
                        });

                        if (!applications.list.length) {
                            return next(new ApplicationError(ApplicationErrorType.UNKNOWN_APP_ERROR, endpoint));
                        }

                        const requestApplication = applications.list[0];
                        application.id = requestApplication.id;
                        application.module = requestApplication.module;
                    }

                    // Check permissions
                    const canAccess = await applicationPermissionDomain.getApplicationPermission({
                        action: ApplicationPermissionsActions.ACCESS_APPLICATION,
                        applicationId: application.id,
                        userId: req.ctx.userId,
                        ctx: req.ctx
                    });

                    if (!canAccess) {
                        return next(new ApplicationError(ApplicationErrorType.FORBIDDEN_ERROR, endpoint));
                    }

                    const rootPath = appRootPath();
                    const appFolder = path.resolve(rootPath, config.applications.rootFolder, application.module);

                    req.ctx.applicationId = application.id;

                    // Request will be handled by express as if it was a regular request to the app folder itself
                    // Thus, we remove the app endpoint from URL.
                    // We don't need the query params to render static files.
                    // Hence, affect path only (=url without query params) to url

                    // Try to locate a file at given path. If not found, serve root path of the app,
                    // considering it will be handled it client-side (e.g. SPAs)
                    const newPath =
                        req.path.replace(new RegExp(`^\/${utils.getFullApplicationEndpoint(endpoint)}`), '') || '/';

                    const files: string[] = await new Promise((resolve, reject) =>
                        glob(`${appFolder}${newPath}`, (err, matches) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(matches);
                        })
                    );
                    const doesPathExists = !!files.length;
                    req.url = doesPathExists ? newPath : '/';
                    express.static(appFolder, {
                        extensions: ['html'],
                        fallthrough: false
                    })(req, res, next);

                    return next();
                },
                async (req: IRequestWithContext, res: Response<unknown>, next: NextFunction) => {
                    try {
                        await applicationDomain.updateConsultationHistory({
                            applicationId: req.ctx.applicationId,
                            ctx: req.ctx
                        });
                    } catch (err) {
                        logger.error(`Cannot update applications consultation history: ${err}`);
                    }
                },
                async (
                    err: undefined | ApplicationError | Error,
                    req: IRequestWithContext<unknown>,
                    res: Response<unknown>,
                    next: NextFunction
                ) => {
                    if (err instanceof ApplicationError && err.appEndpoint !== 'portal') {
                        res.redirect(`/${APPS_URL_PREFIX}/portal/?err=${err.type}&app=${err.appEndpoint}`);
                    } else {
                        return next(err);
                    }
                }
            );

            app.get('/', (req, res) => {
                res.redirect(`/${APPS_URL_PREFIX}/portal/`);
            });
        }
    };
}
