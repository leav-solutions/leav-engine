// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {GraphQLUpload} from 'apollo-server';
import {IAuthApp} from 'app/auth/authApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {IApplicationDomain} from 'domain/application/applicationDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import express, {Express} from 'express';
import {GraphQLResolveInfo} from 'graphql';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {IApplication} from '_types/application';
import {IGetCoreAttributesParams} from '_types/attribute';
import {IRequestWithContext} from '_types/express';
import {IAppGraphQLSchema} from '_types/graphql';
import {ILibrary} from '_types/library';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {ITree} from '_types/tree';
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
    'core.domain.library'?: ILibraryDomain;
    'core.domain.tree'?: ITreeDomain;
    config?: any;
}

export default function({
    'core.app.auth': authApp = null,
    'core.app.graphql': graphqlApp = null,
    'core.domain.application': applicationDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.domain.library': libraryDomain,
    'core.domain.tree': treeDomain,
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

                type Application {
                    id: ID!
                    system: Boolean
                    label(lang: [AvailableLanguage!]): SystemTranslation,
                    description: SystemTranslation
                    libraries: [Library!]!
                    trees: [Tree!]!
                    color: String,
                    icon: String,
                    component: String,
                    endpoint: String,
                    permissions: ApplicationPermissions
                }

                input ApplicationInput {
                    id: ID!
                    label: SystemTranslation,
                    description: SystemTranslationOptional,
                    libraries: [String!],
                    trees: [String!],
                    color: String,
                    icon: String,
                    component: String,
                    endpoint: String,
                }

                input ApplicationsFiltersInput {
                    id: ID,
                    label: String,
                    system: Boolean,
                    endpoint: String,
                    component: String
                }

                type ApplicationsList {
                    totalCount: Int!,
                    list: [Application!]!
                }

                enum ApplicationSortableFields {
                    id
                    system
                    endpoint
                    component
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
                }

                extend type Mutation {
                    saveApplication(application: ApplicationInput!): Application!
                    deleteApplication(id: ID!): Application!
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
                    Application: {
                        async libraries(parent: IApplication, _, ctx: IQueryInfos): Promise<ILibrary[]> {
                            return Promise.all(parent.libraries.map(l => libraryDomain.getLibraryProperties(l, ctx)));
                        },
                        async trees(parent: IApplication, _, ctx: IQueryInfos): Promise<ITree[]> {
                            return Promise.all(parent.trees.map(t => treeDomain.getTreeProperties(t, ctx)));
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
                ['/:endpoint', '/:endpoint/*'],
                // Check authentication and parse token
                async (req: IRequestWithContext, res, next) => {
                    const endpoint = req.params.endpoint;
                    if (endpoint === 'login') {
                        return next();
                    }

                    try {
                        const payload = await authApp.validateRequestToken(req);

                        const ctx: IQueryInfos = {
                            userId: payload.userId,
                            lang: (req.query.lang as string) ?? config.lang.default,
                            queryId: req.body.requestId || uuidv4(),
                            groupsId: []
                        };

                        req.ctx = ctx;
                        next();
                    } catch {
                        res.redirect(`/login?dest=${req.originalUrl}`);
                    }
                },
                // Serve application
                async (req: IRequestWithContext, res, next) => {
                    try {
                        // Get available applications
                        const {endpoint} = req.params;
                        let applicationId;

                        if (endpoint === 'login') {
                            applicationId = 'login';
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
                                throw new Error(`No matching application for endpoint ${endpoint}`);
                            }

                            const requestApplication = applications.list[0];
                            applicationId = requestApplication.id;
                        }

                        const rootPath = appRootPath();
                        const appFolder = path.resolve(rootPath, config.applications.rootFolder, applicationId);

                        // Request will be handled by express as if it was a regular request to the app folder itself
                        // Thus, we remove the app endpoint from URL.
                        // We don't need the query params to render static files.
                        // Hence, affect path only (=url without query params) to url
                        const newPath = req.path.replace(new RegExp(`^\/${endpoint}`), '') || '/';
                        req.url = newPath;
                        express.static(appFolder, {
                            extensions: ['html']
                        })(req, res, next);

                        try {
                            applicationDomain.updateConsultationHistory({applicationId, ctx: req.ctx});
                        } catch (err) {
                            console.error('Could not update application consultation history:', err);
                        }
                    } catch (err) {
                        next(err);
                    }
                },
                async (err, req, res, next) => {
                    console.error({err});
                    res.status(err.statusCode ?? 500).json({
                        status: false,
                        error: err.message
                    });
                }
            );

            app.get('/', (req, res) => {
                res.redirect('/portal');
            });
        }
    };
}
