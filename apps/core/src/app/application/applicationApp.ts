// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {GraphQLUpload} from 'apollo-server';
import {IAuthApp} from 'app/auth/authApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {IApplicationDomain} from 'domain/application/applicationDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IApplicationPermissionDomain} from 'domain/permission/applicationPermissionDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import express, {Express} from 'express';
import glob from 'glob';
import {GraphQLResolveInfo} from 'graphql';
import path from 'path';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import winston from 'winston';
import {IGetCoreAttributesParams} from '_types/attribute';
import {IRequestWithContext} from '_types/express';
import {IAppGraphQLSchema} from '_types/graphql';
import {ILibrary} from '_types/library';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {ITree} from '_types/tree';
import ApplicationError, {ApplicationErrorType} from '../../errors/ApplicationError';
import {
    ApplicationInstallStatuses,
    ApplicationTypes,
    APPS_INSTANCES_FOLDER,
    APPS_URL_PREFIX,
    IApplication,
    IApplicationInstall,
    IApplicationModule
} from '../../_types/application';
import {ApplicationPermissionsActions, PermissionTypes} from '../../_types/permissions';

export interface IApplicationApp {
    registerRoute(app: Express): void;
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.app.auth'?: IAuthApp;
    'core.domain.application'?: IApplicationDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.permission.application'?: IApplicationPermissionDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
    config?: any;
}

export default function ({
    'core.app.auth': authApp = null,
    'core.app.graphql': graphqlApp = null,
    'core.domain.application': applicationDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.domain.permission.application': applicationPermissionDomain = null,
    'core.domain.library': libraryDomain,
    'core.domain.tree': treeDomain,
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

                enum ApplicationInstallStatus {
                    ${Object.values(ApplicationInstallStatuses)
                        .map(status => `${status}`)
                        .join(' ')}
                }

                enum ApplicationType {
                    ${Object.values(ApplicationTypes)
                        .map(type => `${type}`)
                        .join(' ')}
                }

                type ApplicationInstall {
                    status: ApplicationInstallStatus!,
                    lastCallResult: String
                }

                type Application {
                    id: ID!,
                    system: Boolean!,
                    type: ApplicationType!,
                    label(lang: [AvailableLanguage!]): SystemTranslation!,
                    description: SystemTranslation,
                    libraries: [Library!]!,
                    trees: [Tree!]!,
                    color: String,
                    icon: String,
                    module: String!,
                    endpoint: String!,
                    url: String!,
                    permissions: ApplicationPermissions!,
                    install: ApplicationInstall,
                    settings: JSONObject
                }

                type ApplicationModule {
                    id: ID!
                    description: String,
                    version: String
                }

                input ApplicationInput {
                    id: ID!
                    label: SystemTranslation,
                    type: ApplicationType,
                    description: SystemTranslationOptional,
                    libraries: [String!],
                    trees: [String!],
                    color: String,
                    icon: String,
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
                    installApplication(id: ID!): ApplicationInstall!
                }
            `,
                resolvers: {
                    Upload: GraphQLUpload,
                    Query: {
                        async applications(
                            parent,
                            {filters, pagination, sort}: IGetCoreAttributesParams,
                            ctx: IQueryInfos
                        ): Promise<IList<IApplication>> {
                            return applicationDomain.getApplications({
                                params: {filters, pagination, sort},
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
                        },
                        async installApplication(_, {id}, ctx): Promise<IApplicationInstall> {
                            return applicationDomain.runInstall({applicationId: id, ctx});
                        }
                    },
                    Application: {
                        async libraries(parent: IApplication, _, ctx: IQueryInfos): Promise<ILibrary[]> {
                            return Promise.all(
                                (parent?.libraries ?? []).map(l => libraryDomain.getLibraryProperties(l, ctx))
                            );
                        },
                        async trees(parent: IApplication, _, ctx: IQueryInfos): Promise<ITree[]> {
                            return Promise.all((parent?.trees ?? []).map(t => treeDomain.getTreeProperties(t, ctx)));
                        },
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
                        url: (appData: IApplication, _, ctx: IQueryInfos): string => {
                            return applicationDomain.getApplicationUrl({application: appData, ctx});
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
                async (req: IRequestWithContext, res, next) => {
                    const endpoint = req.params.endpoint;
                    const ctx: IQueryInfos = {
                        userId: null,
                        lang: (req.query.lang as string) ?? config.lang.default,
                        queryId: req.body.requestId || uuidv4(),
                        groupsId: []
                    };
                    req.ctx = ctx;

                    if (endpoint === 'login') {
                        return next();
                    }

                    try {
                        const payload = await authApp.validateRequestToken(req);
                        req.ctx.userId = payload.userId;

                        next();
                    } catch {
                        res.redirect(`/${APPS_URL_PREFIX}/login?dest=${req.originalUrl}`);
                    }
                },
                // Serve application
                async (req: IRequestWithContext, res, next) => {
                    try {
                        // Get available applications
                        const {endpoint} = req.params;
                        let applicationId;

                        if (['portal', 'login'].includes(endpoint)) {
                            applicationId = endpoint;
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
                                throw new ApplicationError(ApplicationErrorType.UNKNOWN_APP_ERROR, endpoint);
                            }

                            const requestApplication = applications.list[0];
                            applicationId = requestApplication.id;
                        }

                        // Check permissions
                        const canAccess = await applicationPermissionDomain.getApplicationPermission({
                            action: ApplicationPermissionsActions.ACCESS_APPLICATION,
                            applicationId,
                            userId: req.ctx.userId,
                            ctx: req.ctx
                        });

                        if (!canAccess) {
                            throw new ApplicationError(ApplicationErrorType.FORBIDDEN_ERROR, endpoint);
                        }

                        const rootPath = appRootPath();
                        const appFolder = path.resolve(
                            rootPath,
                            config.applications.rootFolder,
                            APPS_INSTANCES_FOLDER,
                            applicationId
                        );

                        req.ctx.applicationId = applicationId;

                        // Request will be handled by express as if it was a regular request to the app folder itself
                        // Thus, we remove the app endpoint from URL.
                        // We don't need the query params to render static files.
                        // Hence, affect path only (=url without query params) to url

                        // Try to locate a file at given path. If not found, serve root path of the app,
                        // considering it will be handle it client-side (eg. SPAs)
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

                        next();
                    } catch (err) {
                        next(err);
                    }
                },
                async (req: IRequestWithContext, res, next) => {
                    try {
                        applicationDomain.updateConsultationHistory({
                            applicationId: req.ctx.applicationId,
                            ctx: req.ctx
                        });
                    } catch (err) {
                        logger.error(`Cannot update applications consultation history: ${err}`);
                    }
                },
                async (err, req, res, next) => {
                    if (err instanceof ApplicationError && err.appEndpoint !== 'portal') {
                        res.redirect(`/${APPS_URL_PREFIX}/portal?err=${err.type}&app=${err.appEndpoint}`);
                    } else {
                        logger.error(`[${req.ctx.queryId}] ${err}`);
                        res.status(err.statusCode ?? 500).send(err.type ?? 'Internal server error');
                    }
                }
            );

            app.get('/', (req, res) => {
                res.redirect(`/${APPS_URL_PREFIX}/portal`);
            });
        }
    };
}
