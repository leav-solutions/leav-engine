// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FetchResult} from '@apollo/client';
import {
    SaveViewMutation,
    SaveViewMutationVariables,
    GetViewsListQuery,
    GetViewsListQueryVariables,
    useSaveViewMutation
} from '_ui/_gqlTypes';
import {getViewsListQuery} from '_ui/_queries/views/getViewsListQuery';
import {ViewSettingsActionTypes} from '_ui/components/Explorer/manage-view-settings';
import {useViewSettingsContext} from '_ui/components/Explorer/manage-view-settings/store-view-settings/useViewSettingsContext';

export interface IUseSaveViewMutationHook {
    saveView: (variables: SaveViewMutationVariables) => Promise<FetchResult<SaveViewMutation>>;
}

export default function useExecuteSaveViewMutation(): IUseSaveViewMutationHook {
    const {dispatch} = useViewSettingsContext();
    const [executeSaveView] = useSaveViewMutation({
        onCompleted(data) {
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEW_NAME,
                payload: data.saveView.label
            });
        }
    });

    return {
        saveView(variables) {
            return executeSaveView({
                variables,
                update: (cache, mutationResult, options) => {
                    if (options.variables.view.id) {
                        return; // it's an update
                    }

                    const queryToUpdate = {
                        query: getViewsListQuery,
                        variables: {
                            libraryId: options.variables.view.library
                        }
                    };

                    const cacheData = cache.readQuery<GetViewsListQuery, GetViewsListQueryVariables>(queryToUpdate);

                    if (cacheData) {
                        cache.writeQuery<GetViewsListQuery, GetViewsListQueryVariables>({
                            ...queryToUpdate,
                            data: {
                                views: {
                                    list: [...cacheData.views.list, mutationResult.data.saveView],
                                    totalCount: cacheData.views.totalCount + 1
                                }
                            },
                            overwrite: true
                        });
                    }
                }
            });
        }
    };
}
