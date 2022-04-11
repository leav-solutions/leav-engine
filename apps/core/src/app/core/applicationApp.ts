// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GraphQLUpload} from 'apollo-server';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {IApplicationDomain} from 'domain/application/applicationDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {GraphQLResolveInfo} from 'graphql';
import {IApplication} from '_types/application';
import {IGetCoreAttributesParams} from '_types/attribute';
import {IAppGraphQLSchema} from '_types/graphql';
import {ILibrary} from '_types/library';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {ApplicationPermissionsActions, PermissionTypes} from '../../_types/permissions';

export interface ICoreApplicationApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.app.graphql'?: IGraphqlApp;
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.application'?: IApplicationDomain;
    'core.domain.library'?: ILibraryDomain;
}

export default function ({
    'core.app.graphql': graphqlApp = null,
    'core.domain.permission': permissionDomain = null,
    'core.domain.application': applicationDomain,
    'core.domain.library': libraryDomain
}: IDeps = {}): ICoreApplicationApp {
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
                        libraries: [String],
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
        }
    };
}
