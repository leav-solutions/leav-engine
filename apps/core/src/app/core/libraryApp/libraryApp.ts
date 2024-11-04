// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IViewDomain} from 'domain/view/viewDomain';
import {GraphQLResolveInfo} from 'graphql';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {ISystemTranslation} from '_types/systemTranslation';
import {ITree} from '_types/tree';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {LibraryPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import {AttributeCondition, IRecord} from '../../../_types/record';
import {IGraphqlApp} from '../../graphql/graphqlApp';
import {ICoreApp} from '../coreApp';
import {IGetLibraryParams} from './_types';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.view'?: IViewDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.core'?: ICoreApp;
}

export default function ({
    'core.domain.library': libraryDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.view': viewDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.app.graphql': graphqlApp = null,
    'core.app.core': coreApp = null
}: IDeps = {}): ICoreLibraryApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum LibraryBehavior {
                        ${Object.values(LibraryBehavior).join(' ')}
                    }

                    type LibraryPermissions {
                        ${Object.values(LibraryPermissionsActions)
                            .map(action => `${action}: Boolean!`)
                            .join(' ')}
                    }

                    # Specific names generated to query this library on GraphQL
                    type LibraryGraphqlNames {
                        query: String!,
                        type: String!,
                        list: String!,
                        searchableFields: String!,
                        filter: String!
                    }

                    type PreviewVersionSize {
                        name: String!,
                        size: Int!
                    }

                    type PreviewVersion {
                        background: String!,
                        density: Int!,
                        sizes: [PreviewVersionSize!]!
                    }

                    type LibraryPreviewsSettings {
                        label: SystemTranslation!,
                        description: SystemTranslation,
                        versions: PreviewVersion!,
                        system: Boolean!
                    }

                    # Application Library
                    type Library {
                        id: ID!,
                        system: Boolean,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        icon: Record,
                        behavior: LibraryBehavior!,
                        attributes: [Attribute!],
                        fullTextAttributes: [Attribute!],
                        permissions_conf: Treepermissions_conf,
                        recordIdentityConf: RecordIdentityConf,
                        linkedTrees: [Tree!],
                        defaultView: View,
                        permissions: LibraryPermissions,
                        previewsSettings: [LibraryPreviewsSettings!]
                    }

                    input LibraryIconInput {
                        libraryId: String!,
                        recordId: String!
                    }

                    input PreviewVersionSizeInput {
                        name: String!,
                        size: Int!
                    }

                    input PreviewVersionInput {
                        background: String!,
                        density: Int!,
                        sizes: [PreviewVersionSizeInput!]!
                    }

                    input LibraryPreviewsSettingsInput {
                        label: SystemTranslation!,
                        description: SystemTranslationOptional,
                        versions: PreviewVersionInput!
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslation,
                        icon: LibraryIconInput,
                        attributes: [ID!],
                        fullTextAttributes: [ID!],
                        behavior: LibraryBehavior,
                        permissions_conf: Treepermissions_confInput,
                        recordIdentityConf: RecordIdentityConfInput,
                        defaultView: ID,
                        previewsSettings: [LibraryPreviewsSettingsInput!]
                    }

                    input LibrariesFiltersInput {
                        id: [ID!],
                        label: [String!],
                        system: Boolean,
                        behavior: [LibraryBehavior!]
                    }

                    type LibrariesList {
                        totalCount: Int!,
                        list: [Library!]!
                    }

                    enum LibrariesSortableFields {
                        id
                        system
                        behavior
                    }

                    input SortLibraries {
                        field: LibrariesSortableFields!
                        order: SortOrder
                    }

                    type Query {
                        libraries(
                            filters: LibrariesFiltersInput,
                            strictFilters: Boolean,
                            pagination: Pagination,
                            sort: SortLibraries
                        ): LibrariesList
                    }

                    type Mutation {
                        saveLibrary(library: LibraryInput): Library!
                        deleteLibrary(id: ID): Library!
                    }
                `,
                resolvers: {
                    Query: {
                        async libraries(
                            _,
                            {filters, pagination, sort, strictFilters}: IGetLibraryParams,
                            ctx: IQueryInfos
                        ): Promise<IList<ILibrary>> {
                            return libraryDomain.getLibraries({
                                params: {filters, withCount: true, pagination, sort, strictFilters},
                                ctx
                            });
                        }
                    },
                    Mutation: {
                        async saveLibrary(parent, {library}, ctx): Promise<ILibrary> {
                            if (typeof library.attributes !== 'undefined') {
                                library.attributes = library.attributes.map(attrName => ({
                                    id: attrName
                                }));
                            }

                            if (typeof library.fullTextAttributes !== 'undefined') {
                                library.fullTextAttributes = library.fullTextAttributes.map(fullTextAttrName => ({
                                    id: fullTextAttrName
                                }));
                            }

                            const savedLib = await libraryDomain.saveLibrary(library, ctx);
                            graphqlApp.getSchema();

                            return savedLib;
                        },
                        async deleteLibrary(parent, {id}, ctx): Promise<ILibrary> {
                            const deletedLib = await libraryDomain.deleteLibrary(id, ctx);
                            graphqlApp.getSchema();

                            return deletedLib;
                        }
                    },
                    Library: {
                        attributes: async (parent, args, ctx, info): Promise<ILibrary[]> =>
                            attributeDomain.getLibraryAttributes(parent.id, ctx),
                        fullTextAttributes: async (parent, args, ctx, info) =>
                            attributeDomain.getLibraryFullTextAttributes(parent.id, ctx),
                        /**
                         * Return library label, potentially filtered by requested language
                         */
                        label: (libData, args): ISystemTranslation =>
                            coreApp.filterSysTranslationField(libData.label, args.lang || []),
                        icon: async (
                            libData: Override<ILibrary, {icon: {libraryId: string; recordId: string}}>,
                            _,
                            ctx: IQueryInfos
                        ): Promise<IRecord> => {
                            if (!libData.icon) {
                                return null;
                            }

                            const record = await recordDomain.find({
                                params: {
                                    library: libData.icon.libraryId,
                                    filters: [
                                        {field: 'id', value: libData.icon.recordId, condition: AttributeCondition.EQUAL}
                                    ]
                                },
                                ctx
                            });

                            return record.list.length ? record.list[0] : null;
                        },
                        linkedTrees: async (parent, args, ctx): Promise<ITree[]> => {
                            const trees = await treeDomain.getTrees({
                                params: {
                                    filters: {
                                        library: parent.id
                                    }
                                },
                                ctx
                            });

                            return trees.list;
                        },
                        defaultView: (library, _, ctx) =>
                            library.defaultView ? viewDomain.getViewById(library.defaultView, ctx) : null,
                        permissions: (
                            libData: ILibrary,
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo
                        ): Promise<IKeyValue<boolean>> => {
                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);
                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.LIBRARY,
                                    applyTo: libData.id,
                                    action: action as LibraryPermissionsActions,
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
