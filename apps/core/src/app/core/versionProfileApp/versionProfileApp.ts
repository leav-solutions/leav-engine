// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IVersionProfile} from '_types/versionProfile';
import {IDeleteVersionProfileArgs, ISaveVersionProfileArgs, IVersionProfilesArgs} from './_types';

export interface ICoreVersionProfileApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.app.graphql'?: IGraphqlApp;
    'core.domain.versionProfile'?: IVersionProfileDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.permission'?: IPermissionDomain;
}

export default function({
    'core.app.graphql': graphqlApp,
    'core.domain.versionProfile': versionProfileDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.permission': permissionDomain = null
}: IDeps): ICoreVersionProfileApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type VersionProfile {
                        id: String!,
                        label: SystemTranslation!
                        description: SystemTranslation,
                        trees: [Tree!]!
                        linkedAttributes: [Attribute!]!
                    }

                    input VersionProfileInput {
                        id: String!,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        trees: [String!]
                    }

                    input VersionProfilesFiltersInput {
                        id: ID,
                        label: String,
                        trees: String
                    }

                    enum VersionProfilesSortableFields {
                        id
                    }

                    input SortVersionProfilesInput {
                        field: VersionProfilesSortableFields!
                        order: SortOrder
                    }

                    type VersionProfileList {
                        totalCount: Int!
                        list: [VersionProfile!]!
                    }

                    extend type Query {
                        versionProfiles(
                            filters: VersionProfilesFiltersInput,
                            pagination: Pagination,
                            sort: SortVersionProfilesInput,
                        ): VersionProfileList!
                    }

                    extend type Mutation {
                        saveVersionProfile(versionProfile: VersionProfileInput!): VersionProfile!
                        deleteVersionProfile(id: String!): VersionProfile!
                    }
                `,
                resolvers: {
                    Query: {
                        versionProfiles(_, {filters, pagination, sort}: IVersionProfilesArgs, ctx: IQueryInfos) {
                            return versionProfileDomain.getVersionProfiles({
                                params: {filters, withCount: true, pagination, sort},
                                ctx
                            });
                        }
                    },
                    Mutation: {
                        saveVersionProfile(_, {versionProfile}: ISaveVersionProfileArgs, ctx: IQueryInfos) {
                            return versionProfileDomain.saveVersionProfile({versionProfile, ctx});
                        },
                        deleteVersionProfile(_, {id}: IDeleteVersionProfileArgs, ctx: IQueryInfos) {
                            return versionProfileDomain.deleteVersionProfile({id, ctx});
                        }
                    },
                    VersionProfile: {
                        trees(versionProfile: IVersionProfile, _, ctx: IQueryInfos) {
                            return Promise.all(
                                versionProfile.trees.map(treeId => treeDomain.getTreeProperties(treeId, ctx))
                            );
                        },
                        linkedAttributes(versionProfile: IVersionProfile, _, ctx: IQueryInfos) {
                            return versionProfileDomain.getAttributesUsingProfile({id: versionProfile.id, ctx});
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
