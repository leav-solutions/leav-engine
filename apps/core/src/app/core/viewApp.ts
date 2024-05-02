// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordDomain} from 'domain/record/recordDomain';
import {IViewDomain} from 'domain/view/viewDomain';
import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {USERS_LIBRARY} from '../../_types/library';
import {AttributeCondition, IRecord} from '../../_types/record';
import {ViewSizes, ViewTypes} from '../../_types/views';

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.view'?: IViewDomain;
    'core.utils'?: IUtils;
}

export interface IViewApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function ({
    'core.domain.view': viewDomain = null,
    'core.domain.record': recordDomain = null,
    'core.utils': utils = null
}: IDeps): IViewApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            return {
                typeDefs: `
                    enum ViewTypes {
                        ${Object.values(ViewTypes).join(' ')}
                    }

                    enum ViewSizes {
                        ${Object.values(ViewSizes).join(' ')}
                    }

                    type ViewSettings {
                        name: String!,
                        value: Any
                    }

                    type ViewDisplay {
                        type: ViewTypes!,
                        size: ViewSizes!
                    }

                    input ViewSettingsInput {
                        name: String!,
                        value: Any
                    }

                    input ViewDisplayInput {
                        type: ViewTypes!,
                        size: ViewSizes!
                    }

                    type ViewValuesVersion {
                        treeId: String!,
                        treeNode: TreeNode!
                    }

                    input ViewValuesVersionInput {
                        treeId: String!,
                        treeNode: String!
                    }

                    type View {
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
                        sort: RecordSort,
                        display: ViewDisplay!,
                        valuesVersions: [ViewValuesVersion!],
                        settings: [ViewSettings!]
                    }

                    input ViewInput {
                        id: String,
                        library: String!,
                        display: ViewDisplayInput!,
                        shared: Boolean!,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        color: String,
                        filters: [RecordFilterInput!],
                        sort: RecordSortInput,
                        valuesVersions: [ViewValuesVersionInput!],
                        settings: [ViewSettingsInput!]
                    }

                    type ViewsList {
                        totalCount: Int!,
                        list: [View!]!
                    }

                    extend type Query {
                        views(library: String!): ViewsList!
                        view(viewId: String!): View!
                    }

                    extend type Mutation {
                        saveView(view: ViewInput!): View!
                        deleteView(viewId: String!): View!
                    }
                `,
                resolvers: {
                    Query: {
                        views: (_, {library}: {library: string}, ctx: IQueryInfos): Promise<IList<IView>> =>
                            viewDomain.getViews(library, ctx),
                        view: (_, {viewId}: {viewId: string}, ctx: IQueryInfos): Promise<IView> =>
                            viewDomain.getViewById(viewId, ctx)
                    },
                    Mutation: {
                        saveView: (_, {view}: {view: ViewFromGraphQL}, ctx: IQueryInfos): Promise<IView> =>
                            viewDomain.saveView(
                                {
                                    ...view,
                                    valuesVersions: utils.nameValArrayToObj(view.valuesVersions, 'treeId', 'treeNode'),
                                    settings: utils.nameValArrayToObj(view.settings)
                                },
                                ctx
                            ),
                        deleteView: (_, {viewId}: {viewId: string}, ctx: IQueryInfos): Promise<IView> =>
                            viewDomain.deleteView(viewId, ctx)
                    },
                    View: {
                        created_by: async (view: ViewFromGraphQL, _, ctx): Promise<IRecord> => {
                            const record = await recordDomain.find({
                                params: {
                                    library: USERS_LIBRARY,
                                    filters: [
                                        {field: 'id', value: view.created_by, condition: AttributeCondition.EQUAL}
                                    ]
                                },
                                ctx
                            });

                            return record.list.length ? record.list[0] : null;
                        },
                        valuesVersions: (view: IView, _, ctx): IViewValuesVersionForGraphql[] => {
                            if (!view.valuesVersions) {
                                return null;
                            }

                            const versions = Object.keys(view.valuesVersions).map(treeId => ({
                                treeId,
                                treeNode: {id: view.valuesVersions[treeId], treeId}
                            }));
                            return versions;
                        },
                        settings: (view: IView): IViewSettingsNameVal[] | null =>
                            view.settings ? utils.objToNameValArray<IViewSettingsNameVal>(view.settings) : null
                    }
                }
            };
        }
    };
}
