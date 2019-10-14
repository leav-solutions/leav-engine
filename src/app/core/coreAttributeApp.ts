import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreApp} from './coreApp';

export interface ICoreAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    getGraphQLFormat(attribute: IAttribute): string;
}

export default function(
    attributeDomain: IAttributeDomain,
    graphqlApp: IGraphqlApp,
    coreApp: ICoreApp
): ICoreAttributeApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const attributes = await attributeDomain.getAttributes();

            const baseSchema = {
                typeDefs: `
                    enum AttributeType {
                        ${Object.values(AttributeTypes).join(' ')}
                    }

                    enum AttributeFormat {
                        ${Object.values(AttributeFormats).join(' ')}
                    }

                    enum ValueVersionMode {
                        simple
                        smart
                    }

                    enum IOTypes {
                        string
                        number
                        boolean
                        object
                    }

                    # Application Attribute
                    type Attribute {
                        id: ID!,
                        type: AttributeType!,
                        format: AttributeFormat,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        linked_library: String,
                        linked_tree: String,
                        embedded_fields: [EmbeddedAttribute],
                        actions_list: ActionsListConfiguration,
                        permissions_conf: Treepermissions_conf,
                        multiple_values: Boolean!,
                        versions_conf: ValuesVersionsConf
                        inputType: IOTypes
                        outputType: IOTypes
                    }

                    input AttributeInput {
                        id: ID!
                        type: AttributeType!
                        format: AttributeFormat
                        label: SystemTranslationInput,
                        linked_library: String,
                        linked_tree: String,
                        embedded_fields: [EmbeddedAttributeInput],
                        actions_list: ActionsListConfigurationInput,
                        permissions_conf: Treepermissions_confInput,
                        multiple_values: Boolean,
                        versions_conf: ValuesVersionsConfInput
                    }

                    type EmbeddedAttribute {
                        id: ID!,
                        format: AttributeFormat,
                        label: SystemTranslation,
                        validation_regex: String,
                        embedded_fields: [EmbeddedAttribute]
                    }

                    input EmbeddedAttributeInput {
                        id: ID!
                        format: AttributeFormat
                        label: SystemTranslationInput,
                        validation_regex: String,
                        embedded_fields: [EmbeddedAttributeInput]
                    }

                    type ValuesVersionsConf {
                        versionable: Boolean!,
                        mode: ValueVersionMode,
                        trees: [String!]
                    }

                    input ValuesVersionsConfInput {
                        versionable: Boolean!,
                        mode: ValueVersionMode,
                        trees: [String!]
                    }

                    input AttributesFiltersInput {
                        id: ID,
                        type: [AttributeType],
                        format: [AttributeFormat],
                        label: String,
                        system: Boolean,
                        multiple_values: Boolean,
                        versionable: Boolean
                    }

                    type AttributesList {
                        totalCount: Int!,
                        list: [Attribute!]!
                    }

                    enum AttributesSortableFields {
                        id
                        type
                        format
                        linked_library
                        linked_tree
                        multiple_values
                    }

                    input SortAttributes {
                        field: AttributesSortableFields!
                        order: SortOrder
                    }

                    extend type Query {
                        attributes(
                            filters: AttributesFiltersInput,
                            pagination: Pagination,
                            sort: SortAttributes
                        ): AttributesList
                    }

                    extend type Mutation {
                        saveAttribute(attribute: AttributeInput): Attribute!
                        deleteAttribute(id: ID): Attribute!
                    }
                `,
                resolvers: {
                    Query: {
                        async attributes(parent, {filters, pagination, sort}) {
                            return attributeDomain.getAttributes({filters, withCount: true, pagination, sort});
                        }
                    },
                    Mutation: {
                        async saveAttribute(parent, {attribute}, ctx): Promise<IAttribute> {
                            const savedAttr = await attributeDomain.saveAttribute(
                                attribute,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );
                            graphqlApp.generateSchema();

                            return savedAttr;
                        },
                        async deleteAttribute(parent, {id}, ctx): Promise<IAttribute> {
                            const deletedAttr = await attributeDomain.deleteAttribute(
                                id,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );
                            graphqlApp.generateSchema();

                            return deletedAttr;
                        }
                    },
                    Attribute: {
                        /**
                         * Return attribute label, potentially filtered by requested language
                         */
                        label: async (attributeData, args) => {
                            return coreApp.filterSysTranslationField(attributeData.label, args.lang || []);
                        },
                        inputType: attributeData => attributeDomain.getInputType(attributeData),
                        outputType: attributeData => attributeDomain.getOutputType(attributeData)
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        getGraphQLFormat(attribute: IAttribute): string {
            let typeToReturn;

            if (attribute.id === 'id') {
                typeToReturn = 'ID!';
            } else if (
                attribute.type === AttributeTypes.SIMPLE_LINK ||
                attribute.type === AttributeTypes.ADVANCED_LINK
            ) {
                typeToReturn = 'linkValue';
            } else if (attribute.type === AttributeTypes.TREE) {
                typeToReturn = 'treeValue';
            } else {
                typeToReturn = 'Value';
            }

            if (attribute.multiple_values) {
                typeToReturn = `[${typeToReturn}!]`;
            }

            return typeToReturn;
        }
    };
}
