import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import {IList} from '_types/list';
import {IValue, IValueVersion} from '_types/value';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {IRecord} from '../../_types/record';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreAttributeApp} from './attributeApp/attributeApp';
import {ICoreApp} from './coreApp';
import {value} from '.';
import {SlowBuffer} from 'buffer';
import libraryRepo from 'infra/library';

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
            const libraries = await libraryDomain.getLibraries({
                ctx: {
                    userId: 0,
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
                        permissions_conf: Treepermissions_conf,
                        recordIdentityConf: RecordIdentityConf,
                        gqlNames: LibraryGraphqlNames!
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslationInput,
                        attributes: [ID!],
                        behavior: LibraryBehavior,
                        permissions_conf: Treepermissions_confInput,
                        recordIdentityConf: RecordIdentityConfInput
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
                        async libraries(parent, {filters, pagination, sort}, ctx) {
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
                        attributes: async (parent, args, ctx, info) => {
                            return libraryDomain.getLibraryAttributes(parent.id, ctx);
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

                    enum ${libTypeName}Operator {
                        AND
                        OR
                        OPEN_BRACKET
                        CLOSE_BRACKET
                    }

                    enum ${libTypeName}Condition {
                        EQUAL
                        NOT_EQUAL
                        BEGIN_WITH
                        END_WITH
                        CONTAINS
                        NOT_CONTAINS
                        GREATER_THAN
                        LESS_THAN
                    }

                    input ${libTypeName}Filter {
                        field: String,
                        value: String
                        condition: ${libTypeName}Condition,
                        operator: ${libTypeName}Operator
                    }

                    input Sort${libTypeName} {
                        field: String,
                        order: SortOrder!
                    }

                    extend type Query {
                        ${libQueryName}(
                            filters: [${_getLibGqlFilterType(libTypeName)}],
                            sort: Sort${libTypeName}
                            version: [ValueVersionInput],
                            pagination: RecordsPagination,
                            retrieveInactive: Boolean
                        ): ${_getLibGqlListType(libTypeName)}!
                    }
                `;

                baseSchema.resolvers.Query[libQueryName] = async (
                    parent,
                    {filters, sort, version, pagination, retrieveInactive = false},
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
                            retrieveInactive
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
