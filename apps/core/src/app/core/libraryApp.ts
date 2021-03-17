// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IViewDomain} from 'domain/view/viewDomain';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList} from '_types/list';
import {ISystemTranslation} from '_types/systemTranslation';
import {ITree} from '_types/tree';
import {IValue, IValueVersion} from '_types/value';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
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
    'core.app.core.attribute': coreAttributeApp = null,
    'core.app.graphql': graphqlApp = null,
    'core.utils': utils = null,
    'core.app.core': coreApp = null
}: IDeps = {}): ICoreLibraryApp {
    const _getLibGqlFilterType = libTypeName => libTypeName + 'Filter';
    const _getLibGqlSortType = libTypeName => libTypeName + 'Sort';
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
                        attributes: async (parent, args, ctx, info): Promise<IAttribute[]> => {
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
                        )}
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
                        const res = await recordDomain.getRecordFieldValue({
                            library: lib.id,
                            record: parent,
                            attributeId: attribute,
                            options: {
                                version: ctx.version,
                                forceArray: true
                            },
                            ctx
                        });

                        // We add attribute ID on value as it might be useful for nested resolvers (like tree ancestors)
                        // It will be automatically filtered out from response as it's not in the schema
                        return (res as IValue[]).map(v => {
                            return typeof v.value === 'object' && v.value !== null
                                ? {
                                      ...v,
                                      value: {...v.value, attribute}
                                  }
                                : v;
                        });
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
