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
    type IViewV2ValuesVersionForGraphql,
    type PartialViewV2FromGraphQL,
    type ViewV2FromGraphQL,
    ViewV2Sizes,
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

                    enum ViewV2Sizes {
                        ${Object.values(ViewV2Sizes).join(' ')}
                    }

                    type ViewV2Display {
                        type: ViewV2Types!,
                        size: ViewV2Sizes
                    }

                    input ViewV2DisplayInput {
                        type: ViewV2Types!,
                        size: ViewV2Sizes
                    }

                    type ViewV2ValuesVersion {
                        treeId: String!,
                        treeNode: TreeNode!
                    }

                    input ViewV2ValuesVersionInput {
                        treeId: String!,
                        treeNode: String!
                    }

                    type ViewV2 {
                        id: String!,
                        library: String!,
                        created_by: Record!,
                        shared: Boolean!,
                        created_at: Int!,
                        modified_at: Int!,
                        label: SystemTranslation!,
                        description: SystemTranslationOptional,
                        color: String,
                        filters: [RecordFilter!],
                        sort: [RecordSort!],
                        display: ViewV2Display!,
                        valuesVersions: [ViewV2ValuesVersion!],
                        """ The whoAmI column will never be included in attributes because is already hard-coded to be present"""
                        attributes: [Attribute!]
                    }

                    input ViewV2Input {
                        id: String,
                        library: String!,
                        display: ViewV2DisplayInput!,
                        shared: Boolean!,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        color: String,
                        filters: [RecordFilterInput!],
                        sort: [RecordSortInput!],
                        valuesVersions: [ViewV2ValuesVersionInput!],
                        """ The whoAmI column should never be included in attributes because is already hard-coded to be present"""
                        attributes: [String!]
                    }

                    input ViewV2InputPartial {
                        id: String!,
                        library: String,
                        display: ViewV2DisplayInput,
                        shared: Boolean,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        color: String,
                        filters: [RecordFilterInput!],
                        sort: [RecordSortInput!],
                        valuesVersions: [ViewV2ValuesVersionInput!],
                        """ The whoAmI column should never be included in attributes because is already hard-coded to be present"""
                        attributes: [String!]
                    }

                    type ViewsV2List {
                        totalCount: Int!,
                        list: [ViewV2!]!
                    }

                    extend type Query {
                        viewsV2(library: String!): ViewsV2List!
                        viewV2(viewId: String!): ViewV2!
                    }

                    extend type Mutation {
                        saveViewV2(view: ViewV2Input!): ViewV2!
                        updateViewV2(view: ViewV2InputPartial!): ViewV2!
                        deleteViewV2(viewId: String!): ViewV2!
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
                        saveViewV2: (_, {view}: {view: ViewV2FromGraphQL}, ctx: IQueryInfos): Promise<IViewV2> =>
                            viewV2Domain.saveViewV2(
                                {
                                    ...view,
                                    valuesVersions: utils.nameValArrayToObj(view.valuesVersions, 'treeId', 'treeNode'),
                                },
                                ctx,
                            ),
                        updateViewV2: (
                            _,
                            {view}: {view: PartialViewV2FromGraphQL},
                            ctx: IQueryInfos,
                        ): Promise<IViewV2> =>
                            viewV2Domain.saveViewV2(
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
                        created_by: async (view: ViewV2FromGraphQL, _, ctx): Promise<IRecord | null> => {
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

                            const versions = Object.keys(view.valuesVersions).map(treeId => ({
                                treeId,
                                treeNode: {id: view.valuesVersions[treeId], treeId},
                            }));
                            return versions;
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
