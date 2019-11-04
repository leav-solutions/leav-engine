import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import {IList} from '_types/list';
import ValidationError from '../../errors/ValidationError';
import {ILibrary} from '../../_types/library';
import {IRecord} from '../../_types/record';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreAttributeApp} from './attributeApp';
import {ICoreApp} from './coreApp';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.record'?: IRecordDomain;
    'core.app.core.attribute'?: ICoreAttributeApp;
    'core.app.graphql'?: IGraphqlApp;
    'core.utils'?: IUtils;
    'core.app.core'?: ICoreApp;
}

export default function({
    'core.domain.library': libraryDomain = null,
    'core.domain.record': recordDomain = null,
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
            const libraries = await libraryDomain.getLibraries();

            const baseSchema = {
                typeDefs: `
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
                        attributes: [Attribute!],
                        permissions_conf: Treepermissions_conf,
                        recordIdentityConf: RecordIdentityConf,
                        gqlNames: LibraryGraphqlNames!
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslationInput,
                        attributes: [ID!],
                        permissions_conf: Treepermissions_confInput,
                        recordIdentityConf: RecordIdentityConfInput
                    }

                    input LibrariesFiltersInput {
                        id: ID,
                        label: String,
                        system: Boolean
                    }

                    type LibrariesList {
                        totalCount: Int!,
                        list: [Library!]!
                    }

                    enum LibrariesSortableFields {
                        id
                        system
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
                        async libraries(parent, {filters, pagination, sort}, ctx) {
                            return libraryDomain.getLibraries({filters, withCount: true, pagination, sort});
                        }
                    },
                    Mutation: {
                        async saveLibrary(parent, {library}, ctx): Promise<ILibrary> {
                            if (typeof library.attributes !== 'undefined') {
                                library.attributes = library.attributes.map(attrName => ({
                                    id: attrName
                                }));
                            }

                            const savedLib = await libraryDomain.saveLibrary(library, graphqlApp.ctxToQueryInfos(ctx));
                            graphqlApp.generateSchema();

                            return savedLib;
                        },
                        async deleteLibrary(parent, {id}, ctx): Promise<ILibrary> {
                            const deletedLib = await libraryDomain.deleteLibrary(id, graphqlApp.ctxToQueryInfos(ctx));
                            graphqlApp.generateSchema();

                            return deletedLib;
                        }
                    },
                    Library: {
                        attributes: async (parent, args, ctx, info) => {
                            return libraryDomain.getLibraryAttributes(parent.id);
                        },
                        /**
                         * Return library label, potentially filtered by requested language
                         */
                        label: async (libData, args) => {
                            return coreApp.filterSysTranslationField(libData.label, args.lang || []);
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
                        ${lib.attributes.map(
                            attr =>
                                `${attr.id}:
                                ${coreAttributeApp.getGraphQLFormat(attr)}`
                        )}
                    }

                    type ${_getLibGqlListType(libTypeName)} {
                        totalCount: Int,
                        cursor: RecordsListCursor,
                        list: [${libTypeName}!]!
                    }

                    enum ${_getLibGqlSearchableFieldsType(libTypeName)} {
                        ${lib.attributes.map(attr => attr.id).join(' ')}
                    }

                    input ${libTypeName}Filter {
                        field: ${_getLibGqlSearchableFieldsType(libTypeName)}!,
                        value: String!
                    }

                    extend type Query {
                        ${libQueryName}(
                            filters: [${_getLibGqlFilterType(libTypeName)}],
                            version: [ValueVersionInput],
                            pagination: RecordsPagination,
                        ): ${_getLibGqlListType(libTypeName)}!
                    }
                `;

                baseSchema.resolvers.Query[libQueryName] = async (
                    parent,
                    {filters, version, pagination},
                    context,
                    info
                ): Promise<IList<IRecord>> => {
                    const fields = graphqlApp.getQueryFields(info).map(f => f.name);
                    if (
                        pagination &&
                        typeof pagination.offset !== 'undefined' &&
                        typeof pagination.cursor !== 'undefined'
                    ) {
                        throw new ValidationError({pagination: 'Cannot use offset and cursor at the same time'});
                    }

                    if (typeof filters !== 'undefined') {
                        filters = filters.reduce((allFilters, filter) => {
                            allFilters[filter.field] = filter.value;

                            return allFilters;
                        }, {});
                    } else {
                        filters = {};
                    }

                    const formattedVersion =
                        Array.isArray(version) && version.length
                            ? version.reduce((allVers, vers) => {
                                  allVers[vers.name] = vers.value;
                                  return allVers;
                              }, {})
                            : null;

                    context.version = formattedVersion;

                    return recordDomain.find({
                        library: lib.id,
                        filters,
                        pagination,
                        options: {version: formattedVersion},
                        withCount: fields.includes('totalCount')
                    });
                };
                baseSchema.resolvers[libTypeName] = {
                    library: async rec => (rec.library ? libraryDomain.getLibraryProperties(rec.library) : null),
                    whoAmI: recordDomain.getRecordIdentity
                };

                for (const libAttr of lib.attributes) {
                    baseSchema.resolvers[libTypeName][libAttr.id] = async (parent, args, ctx, info) =>
                        recordDomain.getRecordFieldValue(lib.id, parent, libAttr.id, {
                            version: ctx.version
                        });
                }
            }

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
