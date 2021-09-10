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
import {ViewTypes} from '../../_types/views';

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

                    type ViewSettings {
                        name: String!,
                        value: Any
                    }

                    input ViewSettingsInput {
                        name: String!,
                        value: Any
                    }

                    type View {
                        id: String!,
                        library: String!,
                        type: ViewTypes!
                        created_by: User!,
                        shared: Boolean!,
                        created_at: Int!,
                        modified_at: Int!,
                        label: SystemTranslation!,
                        description: SystemTranslationOptional,
                        color: String,
                        filters: [RecordFilter!],
                        sort: RecordSort,
                        settings: [ViewSettings!]
                    }

                    input ViewInput {
                        id: String,
                        library: String!,
                        type: ViewTypes!
                        shared: Boolean!,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        color: String,
                        filters: [RecordFilterInput!],
                        sort: RecordSortInput,
                        settings: [ViewSettingsInput!]
                    }

                    type ViewsList {
                        totalCount: Int!,
                        list: [View!]!
                    }

                    extend type Query {
                        views(library: String!): ViewsList
                    }

                    extend type Mutation {
                        saveView(view: ViewInput!): View!
                        deleteView(viewId: String!): View!
                    }
                `,
                resolvers: {
                    Query: {
                        views: (_, {library}: {library: string}, ctx: IQueryInfos): Promise<IList<IView>> =>
                            viewDomain.getViews(library, ctx)
                    },
                    Mutation: {
                        saveView: (_, {view}: {view: ViewFromGraphQL}, ctx: IQueryInfos): Promise<IView> => {
                            return viewDomain.saveView(
                                {...view, settings: utils.nameValArrayToObj(view.settings)},
                                ctx
                            );
                        },
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
                        settings: (view: IView): IViewSettingsNameVal[] | null => {
                            return view.settings ? utils.objToNameValArray<IViewSettingsNameVal>(view.settings) : null;
                        }
                    }
                }
            };
        }
    };
}
