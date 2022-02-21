// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IViewDomain} from 'domain/view/viewDomain';
import {GraphQLResolveInfo} from 'graphql';
import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {ISystemTranslation} from '_types/systemTranslation';
import {ITree} from '_types/tree';
import {IValueVersion} from '_types/value';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {LibraryPermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import {IRecord} from '../../_types/record';
import {IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreAttributeApp} from './attributeApp/attributeApp';
import {ICoreApp} from './coreApp';

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
    'core.app.core.attribute'?: ICoreAttributeApp;
    'core.app.graphql'?: IGraphqlApp;
    'core.utils'?: IUtils;
    'core.app.core'?: ICoreApp;
}

export default function({
    'core.domain.library': libraryDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.view': viewDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.app.core.attribute': coreAttributeApp = null,
    'core.app.graphql': graphqlApp = null,
    'core.utils': utils = null,
    'core.app.core': coreApp = null
}: IDeps = {}): ICoreLibraryApp {
    const _getLibGqlFilterType = libTypeName => libTypeName + 'Filter';
    const _getLibGqlListType = libTypeName => libTypeName + 'List';
    const _getLibGqlSearchableFieldsType = libTypeName => libTypeName + 'SearchableFields';

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const libraries = await libraryDomain.getLibraries({
                ctx: {
                    userId: '0',
                    queryId: 'libraryAppGenerateBaseSchema'
                }
            });

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

                    # Application Library
                    type Library {
                        id: ID!,
                        system: Boolean,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        behavior: LibraryBehavior!,
                        attributes: [Attribute!],
                        fullTextAttributes: [Attribute!],
                        permissions_conf: Treepermissions_conf,
                        recordIdentityConf: RecordIdentityConf,
                        gqlNames: LibraryGraphqlNames!,
                        linkedTrees: [Tree!],
                        defaultView: View,
                        permissions: LibraryPermissions
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslation,
                        attributes: [ID!],
                        fullTextAttributes: [ID!],
                        behavior: LibraryBehavior,
                        permissions_conf: Treepermissions_confInput,
                        recordIdentityConf: RecordIdentityConfInput,
                        defaultView: ID
                    }

                    input LibrariesFiltersInput {
                        id: ID,
                        label: String,
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
                        async libraries(parent, {filters, pagination, sort}, ctx): Promise<IList<ILibrary>> {
                            return libraryDomain.getLibraries({
                                params: {filters, withCount: true, pagination, sort},
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
                            graphqlApp.generateSchema();

                            return savedLib;
                        },
                        async deleteLibrary(parent, {id}, ctx): Promise<ILibrary> {
                            const deletedLib = await libraryDomain.deleteLibrary(id, ctx);
                            graphqlApp.generateSchema();

                            return deletedLib;
                        }
                    },
                    Library: {
                        attributes: async (parent, args, ctx, info): Promise<ILibrary[]> => {
                            return attributeDomain.getLibraryAttributes(parent.id, ctx);
                        },
                        fullTextAttributes: async (parent, args, ctx, info) => {
                            return attributeDomain.getLibraryFullTextAttributes(parent.id, ctx);
                        },
                        /**
                         * Return library label, potentially filtered by requested language
                         */
                        label: (libData, args): ISystemTranslation => {
                            return coreApp.filterSysTranslationField(libData.label, args.lang || []);
                        },
                        linkedTrees: async (parent, args, ctx, info): Promise<ITree[]> => {
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
                        gqlNames: parent => {
                            const libId = parent.id;
                            const libQueryName = utils.libNameToQueryName(libId);
                            const libTypeName = utils.libNameToTypeName(libId);
                            return {
                                query: libQueryName,
                                type: libTypeName,
                                list: _getLibGqlListType(libTypeName),
                                searchableFields: _getLibGqlSearchableFieldsType(libTypeName),
                                filter: _getLibGqlFilterType(libTypeName)
                            };
                        },
                        defaultView: (library, _, ctx) => {
                            return library.defaultView ? viewDomain.getViewById(library.defaultView, ctx) : null;
                        },
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

            for (const lib of libraries.list) {
                // If library has no attribute at all, it means it's being created and we're just between library
                // creation and attributes linking. So just ignore it now, everyting will be ok when it's fully created.
                // Otherwise it will just break schema generation
                if (!lib.attributes.length) {
                    continue;
                }

                const libQueryName = utils.libNameToQueryName(lib.id);
                const libTypeName = utils.libNameToTypeName(lib.id);

                baseSchema.typeDefs += `
                    type ${libTypeName} implements Record {
                        library: Library!,
                        whoAmI: RecordIdentity!,
                        property(attribute: ID!): [GenericValue!],
                        ${await Promise.all(
                            lib.attributes.map(
                                async attr => `${attr.id}: ${await coreAttributeApp.getGraphQLFormat(attr)}`
                            )
                        )},
                        permissions: RecordPermissions!
                    }

                    type ${_getLibGqlListType(libTypeName)} {
                        totalCount: Int,
                        cursor: RecordsListCursor,
                        list: [${libTypeName}!]!
                    }

                    extend type Query {
                        ${libQueryName}(
                            filters: [RecordFilterInput],
                            sort: RecordSortInput
                            version: [ValueVersionInput],
                            pagination: RecordsPagination,
                            retrieveInactive: Boolean,
                            searchQuery: String
                        ): ${_getLibGqlListType(libTypeName)}!
                    }
                `;

                baseSchema.resolvers.Query[libQueryName] = async (
                    parent,
                    {filters, sort, version, pagination, retrieveInactive = false, searchQuery},
                    ctx,
                    info
                ): Promise<IList<IRecord>> => {
                    const fields = graphqlApp.getQueryFields(info).map(f => f.name);
                    if (
                        pagination &&
                        typeof pagination.offset !== 'undefined' &&
                        typeof pagination.cursor !== 'undefined'
                    ) {
                        throw new ValidationError({pagination: Errors.PAGINATION_OFFSET_AND_CURSOR});
                    }

                    const formattedVersion =
                        Array.isArray(version) && version.length
                            ? version.reduce((allVers, vers) => {
                                  allVers[vers.name] = vers.value;
                                  return allVers;
                              }, {})
                            : null;

                    ctx.version = formattedVersion;

                    return recordDomain.find({
                        params: {
                            library: lib.id,
                            filters,
                            sort,
                            pagination,
                            options: {version: formattedVersion},
                            withCount: fields.includes('totalCount'),
                            retrieveInactive,
                            searchQuery
                        },
                        ctx
                    });
                };
                baseSchema.resolvers[libTypeName] = {
                    library: async (rec, _, ctx) =>
                        rec.library ? libraryDomain.getLibraryProperties(rec.library, ctx) : null,
                    whoAmI: recordDomain.getRecordIdentity,
                    property: async (parent, {attribute}, ctx) => {
                        return recordDomain.getRecordFieldValue({
                            library: lib.id,
                            record: parent,
                            attributeId: attribute,
                            options: {
                                version: ctx.version,
                                forceArray: true
                            },
                            ctx
                        });
                    },
                    permissions: (
                        record: IRecord,
                        _,
                        ctx: IQueryInfos,
                        infos: GraphQLResolveInfo
                    ): Promise<IKeyValue<boolean>> => {
                        const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);

                        return requestedActions.reduce(async (allPermsProm, action) => {
                            const allPerms = await allPermsProm;

                            const isAllowed = await permissionDomain.isAllowed({
                                type: PermissionTypes.RECORD,
                                applyTo: record.library,
                                action: action as RecordPermissionsActions,
                                userId: ctx.userId,
                                target: {
                                    recordId: record.id
                                },
                                ctx
                            });

                            return {...allPerms, [action]: isAllowed};
                        }, Promise.resolve({}));
                    }
                };

                for (const libAttr of lib.attributes) {
                    baseSchema.resolvers[libTypeName][libAttr.id] = async (
                        parent: IRecord,
                        _,
                        ctx: {version: IValueVersion}
                    ) => {
                        const val = await recordDomain.getRecordFieldValue({
                            library: lib.id,
                            record: parent,
                            attributeId: libAttr.id,
                            options: {
                                version: ctx.version
                            },
                            ctx
                        });

                        return Array.isArray(val) ? val.map(v => v?.value) : val?.value;
                    };
                }
            }

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
