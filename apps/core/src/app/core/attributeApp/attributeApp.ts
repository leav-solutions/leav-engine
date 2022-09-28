// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {GraphQLResolveInfo} from 'graphql';
import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema} from '_types/graphql';
import {ILibrary} from '_types/library';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {ITree} from '_types/tree';
import {IVersionProfile} from '_types/versionProfile';
import {ActionsListEvents} from '../../../_types/actionsList';
import {
    AttributeFormats,
    AttributeTypes,
    IAttribute,
    IAttributeVersionsConf,
    IGetCoreAttributesParams,
    IValuesListConf
} from '../../../_types/attribute';
import {AttributePermissionsActions, PermissionTypes} from '../../../_types/permissions';
import {AttributeCondition} from '../../../_types/record';
import {IGraphqlApp} from '../../graphql/graphqlApp';
import {ICoreApp} from '../coreApp';
import {getFormatFromALConf, getFormatFromAttribute} from './helpers/graphqlFormats';

export interface ICoreAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    getGraphQLFormat(attribute: IAttribute): Promise<string>;
}

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.versionProfile'?: IVersionProfileDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.core'?: ICoreApp;
    'core.utils'?: IUtils;
}

export default function (deps: IDeps = {}): ICoreAttributeApp {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.domain.record': recordDomain = null,
        'core.domain.library': libraryDomain = null,
        'core.domain.tree': treeDomain = null,
        'core.domain.permission': permissionDomain = null,
        'core.domain.versionProfile': versionProfileDomain = null,
        'core.app.graphql': graphqlApp = null,
        'core.app.core': coreApp = null,
        'core.utils': utils = null
    } = deps;
    const commonResolvers = {
        /**
         * Return attribute label, potentially filtered by requested language
         */
        label: async (attributeData, args) => {
            return coreApp.filterSysTranslationField(attributeData.label, args.lang || []);
        },
        description: async (attributeData, args) => {
            return coreApp.filterSysTranslationField(attributeData.description, args.lang || []);
        },
        input_types: (attributeData, _, ctx) => attributeDomain.getInputTypes({attrData: attributeData, ctx}),
        output_types: (attributeData, _, ctx) => attributeDomain.getOutputTypes({attrData: attributeData, ctx}),
        metadata_fields: async (attributeData: IAttribute, _, ctx) =>
            !!attributeData.metadata_fields
                ? Promise.all(
                      attributeData.metadata_fields.map(attrId =>
                          attributeDomain.getAttributeProperties({id: attrId, ctx})
                      )
                  )
                : null,
        libraries: (attributeData, _, ctx) =>
            attributeDomain.getAttributeLibraries({attributeId: attributeData.id, ctx}),
        permissions: (
            attributeData: IAttribute,
            {record}: {record: {id: string; library: string}},
            ctx: IQueryInfos,
            infos: GraphQLResolveInfo
        ): Promise<IKeyValue<boolean>> => {
            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);

            return requestedActions.reduce(async (allPermsProm, action) => {
                const allPerms = await allPermsProm;

                const hasRecordInformations = record?.id && record?.library;

                const isAllowed = await permissionDomain.isAllowed({
                    type: hasRecordInformations ? PermissionTypes.RECORD_ATTRIBUTE : PermissionTypes.ATTRIBUTE,
                    applyTo: hasRecordInformations ? record.library : attributeData.id,
                    action: action as AttributePermissionsActions,
                    userId: ctx.userId,
                    target: hasRecordInformations
                        ? {
                              recordId: record.id,
                              attributeId: attributeData.id
                          }
                        : null,
                    ctx
                });

                return {...allPerms, [action]: isAllowed};
            }, Promise.resolve({}));
        }
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const attributesInterfaceSchema = `
                id: ID!,
                type: AttributeType!,
                format: AttributeFormat,
                system: Boolean!,
                readonly: Boolean!,
                label(lang: [AvailableLanguage!]): SystemTranslation,
                description(lang: [AvailableLanguage!]): SystemTranslationOptional,
                actions_list: ActionsListConfiguration,
                permissions_conf: Treepermissions_conf,
                multiple_values: Boolean!,
                versions_conf: ValuesVersionsConf,
                input_types: ActionListIOTypes!,
                output_types: ActionListIOTypes!,
                metadata_fields: [StandardAttribute!],
                libraries: [Library!],

                # Permissions for this attribute.
                # If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
                permissions(record: AttributePermissionsRecord): AttributePermissions!
            `;

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

                    input AttributePermissionsRecord {
                        id: String,
                        library: String!
                    }

                    type AttributePermissions {
                        ${Object.values(AttributePermissionsActions)
                            .map(action => `${action}: Boolean!`)
                            .join(' ')}
                    }


                    interface Attribute {
                        ${attributesInterfaceSchema}
                    }

                    # Application Attribute
                    type StandardAttribute implements Attribute {
                        ${attributesInterfaceSchema}
                        embedded_fields: [EmbeddedAttribute],
                        values_list: StandardValuesListConf,
                    }

                    type LinkAttribute implements Attribute{
                        ${attributesInterfaceSchema}
                        linked_library: Library,
                        values_list: LinkValuesListConf,
                        reverse_link: String
                    }

                    type TreeAttribute implements Attribute{
                        ${attributesInterfaceSchema}
                        linked_tree: Tree,
                        values_list: TreeValuesListConf
                    }

                    input AttributeInput {
                        id: ID!
                        type: AttributeType
                        format: AttributeFormat
                        label: SystemTranslation,
                        readonly: Boolean,
                        description: SystemTranslationOptional,
                        linked_library: String,
                        linked_tree: String,
                        embedded_fields: [EmbeddedAttributeInput],
                        actions_list: ActionsListConfigurationInput,
                        permissions_conf: Treepermissions_confInput,
                        multiple_values: Boolean,
                        versions_conf: ValuesVersionsConfInput,
                        metadata_fields: [String!],
                        values_list: ValuesListConfInput,
                        reverse_link: String
                    }

                    type EmbeddedAttribute {
                        id: ID!,
                        format: AttributeFormat,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        validation_regex: String,
                        embedded_fields: [EmbeddedAttribute]
                    }

                    input EmbeddedAttributeInput {
                        id: ID!
                        format: AttributeFormat
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        validation_regex: String,
                        embedded_fields: [EmbeddedAttributeInput]
                    }

                    type ValuesVersionsConf {
                        versionable: Boolean!,
                        mode: ValueVersionMode,
                        profile: VersionProfile
                    }

                    input ValuesVersionsConfInput {
                        versionable: Boolean!,
                        mode: ValueVersionMode,
                        profile: String
                    }

                    union StandardValuesListConf = StandardStringValuesListConf | StandardDateRangeValuesListConf

                    type StandardStringValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        values: [String!]
                    }
                    type StandardDateRangeValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        values: [DateRangeValue!]
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
                        versionable: Boolean,
                        libraries: [String]
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
                        async attributes(
                            parent,
                            {filters, pagination, sort}: IGetCoreAttributesParams,
                            ctx: IQueryInfos
                        ): Promise<IList<IAttribute>> {
                            return attributeDomain.getAttributes({
                                params: {filters, withCount: true, pagination, sort},
                                ctx
                            });
                        }
                    },
                    Mutation: {
                        async saveAttribute(parent, {attribute}, ctx): Promise<IAttribute> {
                            const savedAttr = await attributeDomain.saveAttribute({attrData: attribute, ctx});
                            graphqlApp.generateSchema();

                            return savedAttr;
                        },
                        async deleteAttribute(parent, {id}, ctx): Promise<IAttribute> {
                            const deletedAttr = await attributeDomain.deleteAttribute({id, ctx});
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
                        }
                    },
                    StandardAttribute: {
                        ...commonResolvers,
                        values_list: (attributeData: IAttribute) => {
                            return attributeData.values_list
                                ? {...attributeData.values_list, attributeFormat: attributeData.format}
                                : null;
                        }
                    },
                    LinkAttribute: {
                        ...commonResolvers,
                        linked_library: (attributeData: IAttribute, _, ctx: IQueryInfos): Promise<ILibrary> => {
                            if (!attributeData.linked_library) {
                                return null;
                            }

                            return libraryDomain.getLibraryProperties(attributeData.linked_library, ctx);
                        },
                        values_list: (attributeData: IAttribute, a2, ctx) => {
                            if (!attributeData?.values_list?.enable) {
                                return attributeData.values_list;
                            }

                            // Here, values is a list of record ID. Return record object instead
                            // TODO: this could be optimized if find() would allow searching for multiple IDs at once
                            return {
                                ...attributeData.values_list,
                                values: (attributeData.values_list.values as string[])
                                    .map(async recId => {
                                        const record = await recordDomain.find({
                                            params: {
                                                library: attributeData.linked_library,
                                                filters: [
                                                    {field: 'id', condition: AttributeCondition.EQUAL, value: recId}
                                                ]
                                            },
                                            ctx
                                        });

                                        return record.list.length ? record.list[0] : null;
                                    })
                                    .filter(r => r !== null) // Remove invalid values (unknown records)
                            };
                        }
                    },
                    TreeAttribute: {
                        ...commonResolvers,
                        linked_tree: (attributeData: IAttribute, _, ctx: IQueryInfos): Promise<ITree> => {
                            if (!attributeData.linked_tree) {
                                return null;
                            }

                            return treeDomain.getTreeProperties(attributeData.linked_tree, ctx);
                        },
                        values_list: async (attributeData: IAttribute, _, ctx) => {
                            ctx.treeId = attributeData.linked_tree;

                            if (!attributeData?.values_list?.enable) {
                                return attributeData.values_list;
                            }

                            // Here, values is a list of tree nodes
                            return {
                                ...attributeData.values_list,
                                values: (
                                    await Promise.all(
                                        (attributeData.values_list.values as string[]).map(async nodeId => {
                                            const isInTree = await treeDomain.isNodePresent({
                                                treeId: attributeData.linked_tree,
                                                nodeId,
                                                ctx
                                            });

                                            // Add treeId to the tree node for further resolvers
                                            return isInTree ? {id: nodeId, treeId: attributeData.linked_tree} : null;
                                        })
                                    )
                                ).filter(r => r !== null)
                            };
                        }
                    },
                    StandardValuesListConf: {
                        __resolveType: (obj: IValuesListConf & {attributeFormat: AttributeFormats}) => {
                            return obj.attributeFormat === AttributeFormats.DATE_RANGE
                                ? 'StandardDateRangeValuesListConf'
                                : 'StandardStringValuesListConf';
                        }
                    },
                    ValuesVersionsConf: {
                        profile: async (
                            conf: IAttributeVersionsConf,
                            args,
                            ctx: IQueryInfos
                        ): Promise<IVersionProfile> => {
                            return versionProfileDomain.getVersionProfileProperties({
                                id: conf.profile,
                                ctx
                            });
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
