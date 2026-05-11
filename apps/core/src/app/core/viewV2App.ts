// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IRecordDomain} from '../../domain/record/recordDomain';
import {type IViewV2Domain} from '../../domain/viewV2/viewV2Domain';
import {type IUtils} from '../../utils/utils';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {USERS_LIBRARY} from '../../_types/library';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {
    type IViewV2,
    type IViewV2CreateInputFromGraphQL,
    type IViewV2UpdateInputFromGraphQL,
    type IViewV2ValuesVersionForGraphql,
    ViewV2Types,
} from '../../_types/viewsV2';
import {type IAttributeDomain} from '../../domain/attribute/attributeDomain';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';

interface IDeps {
    'core.domain.record': IRecordDomain;
    'core.domain.viewV2': IViewV2Domain;
    'core.domain.attribute': IAttributeDomain;
    'core.utils': IUtils;
}

export type IViewV2App = IGraphqlAppModule;

export default function ({
    'core.domain.viewV2': viewV2Domain,
    'core.domain.record': recordDomain,
    'core.domain.attribute': attributeDomain,
    'core.utils': utils,
}: IDeps): IViewV2App {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            return {
                typeDefs: `
                    enum ViewV2Types {
                        ${Object.values(ViewV2Types).join(' ')}
                    }

                    type ViewV2Display {
                        type: ViewV2Types!,
                    }

                    input ViewV2DisplayInput {
                        type: ViewV2Types!,
                    }

                    type ViewV2ValuesVersion {
                        treeId: ID!,
                        treeNode: TreeNode!
                    }

                    input ViewV2ValuesVersionInput {
                        treeId: ID!,
                        treeNode: ID!
                    }

                    type ViewV2 {
                        id: ID!,
                        library: ID!,
                        created_by: Record!,
                        shared: Boolean!,
                        created_at: Int!,
                        modified_at: Int!,
                        label: SystemTranslation!,
                        filters: [RecordFilter!],
                        sort: [RecordSort!],
                        display: ViewV2Display!,
                        valuesVersions: [ViewV2ValuesVersion!],
                        """ The whoAmI column will never be included in attributes because is already hard-coded to be present"""
                        attributes: [Attribute!]
                    }

                    input ViewV2CreateInput {
                        library: ID!,
                        display: ViewV2DisplayInput!,
                        shared: Boolean!,
                        label: SystemTranslation!,
                        filters: [RecordFilterInput!],
                        sort: [RecordSortInput!],
                        valuesVersions: [ViewV2ValuesVersionInput!],
                        """ The whoAmI column should never be included in attributes because is already hard-coded to be present"""
                        attributes: [ID!]
                    }

                    input ViewV2UpdateInput {
                        id: ID!,
                        library: ID,
                        display: ViewV2DisplayInput,
                        shared: Boolean,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        filters: [RecordFilterInput!],
                        sort: [RecordSortInput!],
                        valuesVersions: [ViewV2ValuesVersionInput!],
                        """ The whoAmI column should never be included in attributes because is already hard-coded to be present"""
                        attributes: [ID!]
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
                                    library: USERS_LIBRARY,
                                    filters: [
                                        {field: 'id', value: view.created_by, condition: AttributeCondition.EQUAL},
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
                        attributes: (view: IViewV2, _, ctx: IQueryInfos) =>
                            Promise.all(
                                (view.attributes ?? []).map(attributeId =>
                                    attributeDomain.getAttributeProperties({id: attributeId, ctx}),
                                ),
                            ),
                    },
                },
            };
        },
    };
}
