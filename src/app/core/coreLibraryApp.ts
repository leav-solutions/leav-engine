import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IUtils} from 'utils/utils';
import {IList} from '_types/list';
import {ILibrary} from '../../_types/library';
import {IRecord} from '../../_types/record';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreApp} from './coreApp';
import {ICoreAttributeApp} from './coreAttributeApp';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    libraryDomain: ILibraryDomain,
    recordDomain: IRecordDomain,
    coreAttributeApp: ICoreAttributeApp,
    graphqlApp: IGraphqlApp,
    utils: IUtils,
    coreApp: ICoreApp,
    valueDomain: IValueDomain,
    attributeDomain: IAttributeDomain,
    actionsListDomain: IActionsListDomain
): ICoreLibraryApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const libraries = await libraryDomain.getLibraries();

            const baseSchema = {
                typeDefs: `
                    # Application Library
                    type Library {
                        id: ID!,
                        system: Boolean,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        attributes: [Attribute!],
                        permissions_conf: Treepermissions_conf,
                        recordIdentityConf: RecordIdentityConf
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
                        }
                    }
                }
            };

            for (const lib of libraries.list) {
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

                    type ${libTypeName}List {
                        totalCount: Int!,
                        list: [${libTypeName}!]!
                    }

                    enum ${libTypeName}SearchableFields {
                        ${lib.attributes.map(attr => attr.id).join(' ')}
                    }

                    input ${libTypeName}Filter {
                        field: ${libTypeName}SearchableFields!,
                        value: String!
                    }

                    extend type Query {
                        ${libQueryName}(
                            filters: [${libTypeName}Filter],
                            version: [ValueVersionInput],
                            pagination: Pagination,
                        ): ${libTypeName}List!
                    }
                `;

                baseSchema.resolvers.Query[libQueryName] = async (
                    parent,
                    {filters, version, pagination},
                    context,
                    info
                ): Promise<IList<IRecord>> => {
                    const queryFields = graphqlApp.getQueryFields(info);

                    if (typeof filters !== 'undefined') {
                        filters = filters.reduce((allFilters, filter) => {
                            allFilters[filter.field] = filter.value;

                            return allFilters;
                        }, {});
                    } else {
                        filters = {};
                    }

                    const formattedVersion =
                        typeof version !== 'undefined'
                            ? version.reduce((allVers, vers) => {
                                  allVers[vers.name] = vers.value;
                                  return allVers;
                              }, {})
                            : null;

                    context.version = formattedVersion;

                    return recordDomain.find({
                        library: lib.id,
                        filters,
                        fields: queryFields,
                        pagination,
                        options: {version: formattedVersion}
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
