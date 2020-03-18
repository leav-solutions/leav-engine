import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IUtils} from 'utils/utils';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../../_types/attribute';
import {IAppGraphQLSchema, IGraphqlApp} from '../../graphql/graphqlApp';
import {ICoreApp} from '../coreApp';
import {getFormatFromALConf, getFormatFromAttribute} from './helpers/graphqlFormats';

export interface ICoreAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    getGraphQLFormat(attribute: IAttribute): Promise<string>;
}

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.core'?: ICoreApp;
    'core.utils'?: IUtils;
}

export default function(deps: IDeps = {}): ICoreAttributeApp {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.domain.record': recordDomain = null,
        'core.domain.tree': treeDomain = null,
        'core.app.graphql': graphqlApp = null,
        'core.app.core': coreApp = null,
        'core.utils': utils = null
    } = deps;
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

                    type ActionListIOTypes {
                        ${Object.values(ActionsListEvents).map(event => `${event}: [IOTypes!]!`)}
                    }

                    interface Attribute {
                        id: ID!,
                        type: AttributeType!,
                        format: AttributeFormat,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        actions_list: ActionsListConfiguration,
                        permissions_conf: Treepermissions_conf,
                        multiple_values: Boolean!,
                        versions_conf: ValuesVersionsConf,
                        input_types: ActionListIOTypes!,
                        output_types: ActionListIOTypes!,
                        metadata_fields: [Attribute!]
                    }

                    # Application Attribute
                    type StandardAttribute implements Attribute {
                        id: ID!,
                        type: AttributeType!,
                        format: AttributeFormat,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        embedded_fields: [EmbeddedAttribute],
                        actions_list: ActionsListConfiguration,
                        permissions_conf: Treepermissions_conf,
                        multiple_values: Boolean!,
                        versions_conf: ValuesVersionsConf,
                        input_types: ActionListIOTypes!,
                        output_types: ActionListIOTypes!,
                        metadata_fields: [Attribute!],
                        values_list: StandardValuesListConf
                    }

                    type LinkAttribute implements Attribute{
                        id: ID!,
                        type: AttributeType!,
                        format: AttributeFormat,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        linked_library: String,
                        actions_list: ActionsListConfiguration,
                        permissions_conf: Treepermissions_conf,
                        multiple_values: Boolean!,
                        versions_conf: ValuesVersionsConf,
                        input_types: ActionListIOTypes!,
                        output_types: ActionListIOTypes!,
                        metadata_fields: [Attribute!],
                        values_list: LinkValuesListConf
                    }

                    type TreeAttribute implements Attribute{
                        id: ID!,
                        type: AttributeType!,
                        format: AttributeFormat,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        linked_tree: String,
                        actions_list: ActionsListConfiguration,
                        permissions_conf: Treepermissions_conf,
                        multiple_values: Boolean!,
                        versions_conf: ValuesVersionsConf,
                        input_types: ActionListIOTypes!,
                        output_types: ActionListIOTypes!,
                        metadata_fields: [Attribute!],
                        values_list: TreeValuesListConf
                    }

                    input AttributeInput {
                        id: ID!
                        type: AttributeType
                        format: AttributeFormat
                        label: SystemTranslationInput,
                        linked_library: String,
                        linked_tree: String,
                        embedded_fields: [EmbeddedAttributeInput],
                        actions_list: ActionsListConfigurationInput,
                        permissions_conf: Treepermissions_confInput,
                        multiple_values: Boolean,
                        versions_conf: ValuesVersionsConfInput,
                        metadata_fields: [String!],
                        values_list: ValuesListConfInput
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

                    type StandardValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        values: [String!]
                    }

                    type LinkValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        values: [Record!]
                    }

                    type TreeValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        values: [TreeNode!]
                    }

                    input ValuesListConfInput {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        values: [String!]
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
                        __resolveType: (attr: IAttribute) => {
                            switch (attr.type) {
                                case AttributeTypes.SIMPLE:
                                case AttributeTypes.ADVANCED:
                                    return 'StandardAttribute';
                                case AttributeTypes.SIMPLE_LINK:
                                case AttributeTypes.ADVANCED_LINK:
                                    return 'LinkAttribute';
                                case AttributeTypes.TREE:
                                    return 'TreeAttribute';
                            }
                        },
                        /**
                         * Return attribute label, potentially filtered by requested language
                         */
                        label: async (attributeData, args) => {
                            return coreApp.filterSysTranslationField(attributeData.label, args.lang || []);
                        },
                        input_types: attributeData => attributeDomain.getInputTypes(attributeData),
                        output_types: attributeData => attributeDomain.getOutputTypes(attributeData),
                        metadata_fields: (attributeData: IAttribute) =>
                            !!attributeData.metadata_fields
                                ? attributeData.metadata_fields.map(attrId =>
                                      attributeDomain.getAttributeProperties(attrId)
                                  )
                                : null
                    },
                    LinkAttribute: {
                        values_list: (attributeData: IAttribute, a2) => {
                            if (!attributeData.values_list.enable) {
                                return attributeData.values_list;
                            }

                            // Here, values is a list of record ID. Return record object instead
                            // TODO: this could be optimized if find() would allow searching for multiple IDs at once
                            return {
                                ...attributeData.values_list,
                                values: (attributeData.values_list.values as string[])
                                    .map(async recId => {
                                        const record = await recordDomain.find({
                                            library: attributeData.linked_library,
                                            filters: {id: recId}
                                        });

                                        return record.list.length ? record.list[0] : null;
                                    })
                                    .filter(r => r !== null) // Remove invalid values (unknown records)
                            };
                        }
                    },
                    TreeAttribute: {
                        values_list: async (attributeData: IAttribute, _, ctx) => {
                            ctx.treeId = attributeData.linked_tree;

                            // Here, values is a list of "[id_record]/[id_library]". Return tree node instead
                            return {
                                ...attributeData.values_list,
                                values: (attributeData.values_list.values as string[])
                                    .map(async treeElem => {
                                        const [library, id] = treeElem.split('/');
                                        const record = await recordDomain.find({
                                            library,
                                            filters: {id}
                                        });
                                        const isInTree = await treeDomain.isElementPresent(attributeData.linked_tree, {
                                            library,
                                            id: Number(id)
                                        });
                                        const ret = record.list.length && isInTree ? {record: record.list[0]} : null;
                                        return ret;
                                    })
                                    .filter(r => r !== null)
                            };
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        async getGraphQLFormat(attribute: IAttribute): Promise<string> {
            let typeToReturn;

            if (attribute.id === 'id') {
                typeToReturn = 'ID!';
            } else if (
                attribute.type === AttributeTypes.SIMPLE_LINK ||
                attribute.type === AttributeTypes.ADVANCED_LINK
            ) {
                typeToReturn = utils.libNameToTypeName(attribute.linked_library);
            } else if (attribute.type === AttributeTypes.TREE) {
                typeToReturn = 'TreeNode';
            } else {
                // Get actions list output type if any
                if (attribute?.actions_list?.getValue.length) {
                    typeToReturn = await getFormatFromALConf([...attribute?.actions_list?.getValue], deps);
                }

                if (!typeToReturn) {
                    typeToReturn = getFormatFromAttribute(attribute.format);
                }
            }

            if (attribute.multiple_values) {
                typeToReturn = `[${typeToReturn}!]`;
            }

            return typeToReturn;
        }
    };
}
