import {SystemLibraries} from '../../_constants/systemLibraries';
import {type IAttributeDomain} from '../../domain/attribute/attributeDomain';
import {type IRecordDomain} from '../../domain/record/recordDomain';
import {type IViewV2Domain} from '../../domain/viewV2/viewV2Domain';
import {type IUtils} from '../../utils/utils';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {
    type IViewV2,
    type IViewV2DisplayAttribute,
    type IViewV2CreateInputFromGraphQL,
    type IViewV2Filter,
    type IViewV2Sort,
    type IViewV2UpdateInputFromGraphQL,
    type IViewV2ValuesVersionForGraphql,
    ViewV2Shortcut,
    ViewV2Types,
} from '../../_types/viewsV2';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {CommonAttributes} from '../../_constants/systemAttributes';

interface IDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.viewV2': IViewV2Domain;
    'core.utils': IUtils;
}

export type IViewV2App = IGraphqlAppModule;

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.viewV2': viewV2Domain,
    'core.domain.record': recordDomain,
    'core.utils': utils,
}: IDeps): IViewV2App {
    const _resolveAttribute = (parent: {attributeId: string}, _: unknown, ctx: IQueryInfos) =>
        attributeDomain.getAttributeProperties({id: parent.attributeId, ctx});

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            return {
                typeDefs: `
                    enum ViewV2Types {
                        ${Object.values(ViewV2Types).join(' ')}
                    }

                    enum ViewV2Shortcut {
                        ${Object.values(ViewV2Shortcut).join(' ')}
                    }

                    type ViewV2DisplayAttribute {
                        attribute: Attribute!,
                        visible: Boolean!
                    }

                    input ViewV2DisplayAttributeInput {
                        attributeId: ID!,
                        visible: Boolean!
                    }

                    type ViewV2Display {
                        type: ViewV2Types!,
                        attributes: [ViewV2DisplayAttribute!]!,
                    }

                    input ViewV2DisplayInput {
                        type: ViewV2Types!,
                        """ The whoAmI column should never be included in attributes because is already hard-coded to be present"""
                        attributes: [ViewV2DisplayAttributeInput!],
                    }

                    type ViewV2ValuesVersion {
                        treeId: ID!,
                        treeNode: TreeNode!
                    }

                    input ViewV2ValuesVersionInput {
                        treeId: ID!,
                        treeNode: ID!
                    }

                    type ViewV2Filter {
                        pinned: Boolean!,
                        attributes: [Attribute!]!,
                        values: [String]!,
                        condition: RecordFilterCondition!,
                    }

                    input ViewV2FilterInput {
                        pinned: Boolean!,
                        attributes: [ID!]!,
                        values: [String]!,
                        condition: RecordFilterCondition!,
                    }

                    type ViewV2Sort {
                        pinned: Boolean!,
                        attributes: [Attribute!]!,
                        order: SortOrder!,
                    }

                    input ViewV2SortInput {
                        pinned: Boolean!,
                        attributes: [ID!]!,
                        order: SortOrder!,
                    }

                    type ViewV2 {
                        id: ID!,
                        library: ID!,
                        created_by: Record!,
                        shared: Boolean!,
                        created_at: Int!,
                        modified_at: Int!,
                        label: SystemTranslation!,
                        filters: [ViewV2Filter!]!,
                        sorts: [ViewV2Sort!]!,
                        shortcuts: [ViewV2Shortcut!]!,
                        display: ViewV2Display!,
                        valuesVersions: [ViewV2ValuesVersion!],
                    }

                    input ViewV2CreateInput {
                        library: ID!,
                        display: ViewV2DisplayInput!,
                        shared: Boolean!,
                        label: SystemTranslation!,
                        filters: [ViewV2FilterInput!],
                        sorts: [ViewV2SortInput!],
                        shortcuts: [ViewV2Shortcut!],
                        valuesVersions: [ViewV2ValuesVersionInput!],
                    }

                    input ViewV2UpdateInput {
                        id: ID!,
                        library: ID,
                        display: ViewV2DisplayInput,
                        shared: Boolean,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        filters: [ViewV2FilterInput!],
                        sorts: [ViewV2SortInput!],
                        shortcuts: [ViewV2Shortcut!],
                        valuesVersions: [ViewV2ValuesVersionInput!],
                    }

                    type ViewsV2List {
                        totalCount: Int!,
                        list: [ViewV2!]!
                    }

                    extend type Query {
                        viewsV2(library: ID!): ViewsV2List!
                        viewV2(viewId: ID!): ViewV2!
                    }

                    extend type Mutation {
                        createViewV2(view: ViewV2CreateInput!): ViewV2!
                        updateViewV2(view: ViewV2UpdateInput!): ViewV2!
                        deleteViewV2(viewId: ID!): ViewV2!
                    }
                `,
                resolvers: {
                    Query: {
                        viewsV2: (_, {library}: {library: string}, ctx: IQueryInfos): Promise<IList<IViewV2>> =>
                            viewV2Domain.getViewsV2(library, ctx),
                        viewV2: (_, {viewId}: {viewId: string}, ctx: IQueryInfos): Promise<IViewV2> =>
                            viewV2Domain.getViewV2ById(viewId, ctx),
                    },
                    Mutation: {
                        createViewV2: (
                            _,
                            {view}: {view: IViewV2CreateInputFromGraphQL},
                            ctx: IQueryInfos,
                        ): Promise<IViewV2> =>
                            viewV2Domain.createViewV2(
                                {
                                    ...view,
                                    valuesVersions: utils.nameValArrayToObj(view.valuesVersions, 'treeId', 'treeNode'),
                                },
                                ctx,
                            ),
                        updateViewV2: (
                            _,
                            {view}: {view: IViewV2UpdateInputFromGraphQL},
                            ctx: IQueryInfos,
                        ): Promise<IViewV2> =>
                            viewV2Domain.updateViewV2(
                                {
                                    ...view,
                                    valuesVersions: utils.nameValArrayToObj(view.valuesVersions, 'treeId', 'treeNode'),
                                },
                                ctx,
                            ),
                        deleteViewV2: (_, {viewId}: {viewId: string}, ctx: IQueryInfos): Promise<IViewV2> =>
                            viewV2Domain.deleteViewV2(viewId, ctx),
                    },
                    ViewV2: {
                        created_by: async (view: IViewV2, _, ctx): Promise<IRecord | null> => {
                            const record = await recordDomain.find({
                                params: {
                                    library: SystemLibraries.USERS,
                                    filters: [
                                        {
                                            field: CommonAttributes.ID,
                                            value: view.created_by,
                                            condition: AttributeCondition.EQUAL,
                                        },
                                    ],
                                },
                                ctx,
                            });

                            return record.list.length ? record.list[0] : null;
                        },
                        valuesVersions: (view: IViewV2): IViewV2ValuesVersionForGraphql[] | null => {
                            if (!view.valuesVersions) {
                                return null;
                            }

                            return Object.keys(view.valuesVersions).map(treeId => ({
                                treeId,
                                treeNode: {id: view.valuesVersions[treeId], treeId},
                            }));
                        },
                    },
                    ViewV2Filter: {
                        attributes: (filter: IViewV2Filter, _, ctx: IQueryInfos) =>
                            Promise.all(filter.attributes.map(id => attributeDomain.getAttributeProperties({id, ctx}))),
                    },
                    ViewV2Sort: {
                        attributes: (sort: IViewV2Sort, _, ctx: IQueryInfos) =>
                            Promise.all(sort.attributes.map(id => attributeDomain.getAttributeProperties({id, ctx}))),
                    },
                    ViewV2DisplayAttribute: {
                        attribute: (attribute: IViewV2DisplayAttribute, _, ctx: IQueryInfos) =>
                            attributeDomain.getAttributeProperties({id: attribute.attributeId, ctx}),
                    },
                },
            };
        },
    };
}
