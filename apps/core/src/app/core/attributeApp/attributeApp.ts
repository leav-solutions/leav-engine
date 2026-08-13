import {type IActionsListDomain} from '../../../domain/actionsList/actionsListDomain';
import {type IAttributeDomain} from '../../../domain/attribute/attributeDomain';
import {type ILibraryDomain} from '../../../domain/library/libraryDomain';
import {type IPermissionDomain} from '../../../domain/permission/permissionDomain';
import {type IAttributeDependentValuesPermissionDomain} from '../../../domain/permission/attributeDependentValuesPermissionDomain';
import {type IfLibraryJoinLinkAttribute} from '../../../domain/attribute/helpers/ifLibraryJoinLinkAttribute';
import {type IRecordDomain} from '../../../domain/record/recordDomain';
import {type ITreeDomain} from '../../../domain/tree/treeDomain';
import {type IVersionProfileDomain} from '../../../domain/versionProfile/versionProfileDomain';
import {type GraphQLResolveInfo} from 'graphql';
import {type IAppGraphQLSchema} from '../../../_types/graphql';
import {type IList} from '../../../_types/list';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IKeyValue} from '../../../_types/shared';
import {ActionsListEvents} from '../../../_types/actionsList';
import {
    AttributeFormats,
    AttributeTypes,
    MultiDisplayOption,
    TreeSelectableNodes,
    type IAttribute,
    type IAttributeFilterOptions,
    type IAttributeVersionsConf,
    type IGetCoreAttributesParams,
    type IValuesListConf,
} from '../../../_types/attribute';
import {
    AttributeDependentValuesPermissionsActions,
    AttributePermissionsActions,
    PermissionTypes,
} from '../../../_types/permissions';
import {AttributeCondition, type IRecord} from '../../../_types/record';
import {type IGraphqlAppModule, type IGraphqlApp} from '../../graphql/graphqlApp';
import {type ICoreApp} from '../coreApp';
import {type Override} from '@leav/utils';
import {type ITreeNode} from '../../../_types/tree';

export type ICoreAttributeApp = IGraphqlAppModule;

interface IDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': IfLibraryJoinLinkAttribute;
    'core.domain.library': ILibraryDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.tree': ITreeDomain;
    'core.domain.actionsList': IActionsListDomain;
    'core.domain.permission': IPermissionDomain;
    'core.domain.permission.attributeDependentValues': IAttributeDependentValuesPermissionDomain;
    'core.domain.versionProfile': IVersionProfileDomain;
    'core.app.graphql': IGraphqlApp;
    'core.app.core': ICoreApp;
}

export default function (deps: IDeps): ICoreAttributeApp {
    const {
        'core.domain.attribute': attributeDomain,
        'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': ifLibraryJoinLinkAttribute,
        'core.domain.record': recordDomain,
        'core.domain.library': libraryDomain,
        'core.domain.tree': treeDomain,
        'core.domain.permission': permissionDomain,
        'core.domain.permission.attributeDependentValues': attributeDependentValuesPermissionDomain,
        'core.domain.versionProfile': versionProfileDomain,
        'core.app.graphql': graphqlApp,
        'core.app.core': coreApp,
    } = deps;
    const commonResolvers = {
        /**
         * Return attribute label, potentially filtered by requested language
         */
        label: async (attributeData, args) => coreApp.filterSysTranslationField(attributeData.label, args.lang || []),
        description: async (attributeData, args) =>
            coreApp.filterSysTranslationField(attributeData.description, args.lang || []),
        input_types: (attributeData, _, ctx) => attributeDomain.getInputTypes({attrData: attributeData, ctx}),
        output_types: (attributeData, _, ctx) => attributeDomain.getOutputTypes({attrData: attributeData, ctx}),
        compute: attributeData => attributeDomain.doesCompute(attributeData),
        metadata_fields: async (attributeData: IAttribute, _, ctx) =>
            attributeData.metadata_fields
                ? Promise.all(
                      attributeData.metadata_fields.map(attrId =>
                          attributeDomain.getAttributeProperties({id: attrId, ctx}),
                      ),
                  )
                : null,
        libraries: (attributeData, _, ctx) =>
            attributeDomain.getAttributeLibraries({attributeId: attributeData.id, ctx}),
        permissions: (
            attributeData: IAttribute,
            {record}: {record: {id: string; library: string}},
            ctx: IQueryInfos,
            infos: GraphQLResolveInfo,
        ): Promise<IKeyValue<boolean>> => {
            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);

            return requestedActions.reduce(async (allPermsProm, action) => {
                const allPerms = await allPermsProm;

                const hasRecordInformations = record?.id && record?.library;

                const isAllowed = await permissionDomain.isAllowed(
                    hasRecordInformations
                        ? {
                              type: PermissionTypes.RECORD_ATTRIBUTE,
                              applyTo: record.library,
                              action: action as AttributePermissionsActions,
                              target: {
                                  recordId: record.id,
                                  attributeId: attributeData.id,
                              },
                              ctx,
                          }
                        : {
                              type: PermissionTypes.ATTRIBUTE,
                              applyTo: attributeData.id,
                              action: action as AttributePermissionsActions,
                              ctx,
                          },
                );

                return {...allPerms, [action]: isAllowed};
            }, Promise.resolve({}));
        },
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const attributesInterfaceSchema = `
                id: ID!,
                type: AttributeType!,
                format: AttributeFormat,
                required: Boolean!,
                system: Boolean!,
                readonly: Boolean!,
                label(lang: [AvailableLanguage!]): SystemTranslation,
                description(lang: [AvailableLanguage!]): SystemTranslationOptional,
                actions_list: ActionsListConfiguration,
                permissions_conf: Treepermissions_conf,
                multiple_values: Boolean!,
                multi_link_display_option: MultiDisplayOption
                multi_tree_display_option: MultiDisplayOption
                versions_conf: ValuesVersionsConf,
                input_types: ActionListIOTypes!,
                output_types: ActionListIOTypes!,
                metadata_fields: [StandardAttribute!],
                libraries: [Library!],
                compute: Boolean!,
                settings: JSONObject,

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

                    enum MultiDisplayOption {
                        ${Object.values(MultiDisplayOption).join(' ')}
                    }

                    enum TreeSelectableNodes {
                        ${Object.values(TreeSelectableNodes).join(' ')}
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
                        unique: Boolean,
                        character_limit: Int
                        smart_filter: SmartFilterConf
                    }

                    type LinkAttribute implements Attribute {
                        ${attributesInterfaceSchema}
                        linked_library: Library, # TODO : https://aristid.atlassian.net/browse/XSTREAM-1155
                        values_list: LinkValuesListConf,
                        reverse_link: String
                        smart_filter: SmartFilterConf
                    }

                    type TreeAllowedDependentValues {
                        # nodeId may be null for root node
                        nodeId: ID
                    }

                    type TreeDependentValuesNode {
                        # node may be null for root node
                        node: TreeNodeLight
                        allowedDependentValues: [TreeAllowedDependentValues!]
                    }

                    input AttributeDependentValueInput {
                        attributeId: ID!,
                        # nodeId may be null for root node
                        nodeId: ID
                    }

                    type TreeSelectionConf {
                        selectableNodes: TreeSelectableNodes
                        defaultExpanded: Boolean
                        displayRootNode: ID
                        maxDepth: Int
                        showSelectChildrenButton: Boolean
                        showSelectDescendantsButton: Boolean
                    }

                    input TreeSelectionConfInput {
                        selectableNodes: TreeSelectableNodes
                        defaultExpanded: Boolean
                        displayRootNode: ID
                        maxDepth: Int
                        showSelectChildrenButton: Boolean
                        showSelectDescendantsButton: Boolean
                    }

                    type TreeAttribute implements Attribute {
                        ${attributesInterfaceSchema}
                        linked_tree: Tree,
                        values_list: TreeValuesListConf,
                        permissions_conf_dependent_values: TreePermissionsDependentValuesConf
                        """ Selection behavior of this tree attribute (form field and selection modal) """
                        tree_selection_conf: TreeSelectionConf
                        """ List of all tree nodes with their allowed dependent values for this attribute, include null node for root if applicable."""
                        tree_values(attributeDependentValue: AttributeDependentValueInput): [TreeDependentValuesNode!]
                    }

                    input AttributeInput {
                        id: ID!,
                        type: AttributeType,
                        format: AttributeFormat,
                        label: SystemTranslation,
                        readonly: Boolean,
                        required: Boolean,
                        description: SystemTranslationOptional,
                        linked_library: String,
                        linked_tree: String,
                        embedded_fields: [EmbeddedAttributeInput],
                        actions_list: ActionsListConfigurationInput,
                        permissions_conf: Treepermissions_confInput,
                        permissions_conf_dependent_values: TreePermissionsDependentValuesConfInput,
                        """ only for tree attribute """
                        tree_selection_conf: TreeSelectionConfInput,
                        multiple_values: Boolean,
                        versions_conf: ValuesVersionsConfInput,
                        metadata_fields: [String!],
                        values_list: ValuesListConfInput,
                        reverse_link: String,
                        unique: Boolean,
                        character_limit: Int,
                        settings: JSONObject
                        multi_link_display_option: MultiDisplayOption
                        multi_tree_display_option: MultiDisplayOption
                        """ only for link or standard attribute """
                        smart_filter: SmartFilterConfInput
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
                        allowListUpdate: Boolean,
                        values: [String!]
                    }

                    type StandardDateRangeValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        allowListUpdate: Boolean,
                        values: [DateRangeValue!]
                    }

                    type LinkValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        allowListUpdate: Boolean,
                        values: [Record!]
                    }

                    type TreeValuesListConf {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        allowListUpdate: Boolean,
                        values: [TreeNode!]
                    }

                    input ValuesListConfInput {
                        enable: Boolean!,
                        allowFreeEntry: Boolean,
                        allowListUpdate: Boolean,
                        values: [String!]
                    }

                    type SmartFilterConf {
                        enable: Boolean!
                        through: Attribute
                    }

                    input SmartFilterConfInput {
                        enable: Boolean!
                    }

                    input AttributesFiltersInput {
                        id: ID,
                        ids: [ID!],
                        type: [AttributeType!],
                        format: [AttributeFormat!],
                        label: String,
                        system: Boolean,
                        multiple_values: Boolean,
                        versionable: Boolean,
                        libraries: [String!],
                        librariesExcluded: [String!]
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
                            _,
                            {
                                filters,
                                pagination,
                                sort,
                            }: Override<
                                IGetCoreAttributesParams,
                                {filters?: IAttributeFilterOptions & {ids?: string[]}}
                            >,
                            ctx: IQueryInfos,
                        ): Promise<IList<IAttribute>> {
                            const applicableFilters = {
                                ...filters,
                                id: filters?.ids ?? filters?.id,
                            };
                            delete applicableFilters.ids;

                            return attributeDomain.getAttributes({
                                params: {filters: applicableFilters, withCount: true, pagination, sort},
                                ctx,
                            });
                        },
                    },
                    Mutation: {
                        async saveAttribute(parent, {attribute}, ctx): Promise<IAttribute> {
                            return attributeDomain.saveAttribute({attrData: attribute, ctx});
                        },
                        async deleteAttribute(parent, {id}, ctx): Promise<IAttribute> {
                            return attributeDomain.deleteAttribute({id, ctx});
                        },
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
                    },
                    StandardAttribute: {
                        ...commonResolvers,
                        values_list: (attributeData: IAttribute) =>
                            attributeData.values_list
                                ? {...attributeData.values_list, attributeFormat: attributeData.format}
                                : null,
                    },
                    LinkAttribute: {
                        ...commonResolvers,
                        linked_library: (attributeData: IAttribute, _, ctx: IQueryInfos) => {
                            if (!attributeData.linked_library) {
                                return null;
                            }

                            return libraryDomain.getLibraryProperties(attributeData.linked_library, ctx);
                        },
                        values_list: async (attributeData: IAttribute, a2, ctx) => {
                            if (!attributeData.values_list) {
                                return null;
                            }

                            return {
                                ...attributeData.values_list,
                                // TODO: this could be optimized if find() would allow searching for multiple IDs at once
                                values: (
                                    await Promise.all(
                                        ((attributeData.values_list?.values ?? []) as string[]).map(
                                            async (recId): Promise<IRecord | null> => {
                                                const record = await recordDomain.find({
                                                    params: {
                                                        library: attributeData.linked_library,
                                                        filters: [
                                                            {
                                                                field: 'id',
                                                                condition: AttributeCondition.EQUAL,
                                                                value: recId,
                                                            },
                                                        ],
                                                    },
                                                    ctx,
                                                });

                                                return record.list.length ? record.list[0] : null;
                                            },
                                        ),
                                    )
                                ).filter(r => r !== null), // Remove invalid values (unknown records)
                            };
                        },
                        smart_filter: async (attributeData: IAttribute, _, ctx: IQueryInfos) => {
                            if (!attributeData.smart_filter?.enable) {
                                return null;
                            }

                            const throughAttribute = async () =>
                                ifLibraryJoinLinkAttribute(
                                    attributeData,
                                    async (joinLibId, joinAttributeProps) => joinAttributeProps,
                                    ctx,
                                );

                            return {
                                enable: true,
                                through: throughAttribute, // exec only when in graphql query
                            };
                        },
                    },
                    TreeAttribute: {
                        ...commonResolvers,
                        linked_tree: (attributeData: IAttribute, _, ctx: IQueryInfos) => {
                            if (!attributeData.linked_tree) {
                                return null;
                            }

                            return treeDomain.getTreeProperties(attributeData.linked_tree, ctx);
                        },
                        values_list: async (attributeData: IAttribute, _, ctx) => {
                            if (!attributeData.values_list) {
                                return null;
                            }

                            // Here, values is a list of tree nodes
                            return {
                                ...attributeData.values_list,
                                values: (
                                    await Promise.all(
                                        ((attributeData.values_list?.values as string[]) ?? []).map(async nodeId => {
                                            const isInTree = await treeDomain.isNodePresent({
                                                treeId: attributeData.linked_tree,
                                                nodeId,
                                                ctx: {...ctx, treeId: attributeData.linked_tree},
                                            });

                                            // Add treeId to the tree node for further resolvers
                                            return isInTree ? {id: nodeId, treeId: attributeData.linked_tree} : null;
                                        }),
                                    )
                                ).filter(r => r !== null),
                            };
                        },
                        tree_values: async (
                            attributeData: IAttribute,
                            {
                                attributeDependentValue,
                            }: {
                                attributeDependentValue?: {nodeId: string | null; attributeId: string};
                            },
                            ctx: IQueryInfos,
                        ) => {
                            const treeValues: Array<ITreeNode | null> = (
                                await treeDomain.getElementChildren({
                                    treeId: attributeData.linked_tree,
                                    nodeId: null,
                                    ctx,
                                })
                            ).list;

                            // Even when attribute is required, we may need to know allowed dependent values for root (null) node
                            treeValues.push(null);

                            const hasDependentValues =
                                attributeData.permissions_conf_dependent_values != null &&
                                attributeData.permissions_conf_dependent_values.dependenciesTreeAttributes.length &&
                                attributeData.permissions_conf_dependent_values.dependenciesTreeAttributes.includes(
                                    attributeData.id,
                                );

                            const allValues = treeValues
                                .filter(childNode => !attributeData.required || childNode !== null)
                                .map(childNode => ({
                                    nodeId: childNode?.id || null,
                                }));

                            return Promise.all(
                                treeValues.map(async child => ({
                                    node: child,
                                    allowedDependentValues:
                                        (hasDependentValues &&
                                            (await attributeDependentValuesPermissionDomain.filterAllowedWorkflowDependentValues(
                                                {
                                                    action: AttributeDependentValuesPermissionsActions.SET_VALUE,
                                                    attributeId: attributeData.id,
                                                    targetValue: {
                                                        nodeId: child?.id || null,
                                                    },
                                                    dependentValue: attributeDependentValue,
                                                    allValues,
                                                    ctx,
                                                },
                                            ))) ||
                                        null,
                                })),
                            );
                        },
                    },
                    StandardValuesListConf: {
                        __resolveType: (obj: IValuesListConf & {attributeFormat: AttributeFormats}) =>
                            obj.attributeFormat === AttributeFormats.DATE_RANGE
                                ? 'StandardDateRangeValuesListConf'
                                : 'StandardStringValuesListConf',
                    },
                    ValuesVersionsConf: {
                        profile: async (conf: IAttributeVersionsConf, args, ctx: IQueryInfos) => {
                            if (!conf.profile) {
                                return null;
                            }

                            return versionProfileDomain.getVersionProfileProperties({
                                id: conf.profile,
                                ctx,
                            });
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
