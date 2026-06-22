import {type Dispatch, useState} from 'react';
import {type IViewSettingsAction, ViewSettingsActionTypes} from './manage-view-settings-v2';
import {type SetNewPage} from './_types';

export const usePagination = (dispatch: Dispatch<IViewSettingsAction>) => {
    const [currentPage, setCurrentPage] = useState(1);

    const setNewPage: SetNewPage = (newCurrentPage: number, ignoredPageSize: number) => {
        setCurrentPage(newCurrentPage);
    };

    const setNewPageSize = (ignoredCurrentPage: number, newPageSize: number) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_PAGE_SIZE,
            payload: {
                pageSize: newPageSize,
            },
        });
    };

    return {
        currentPage,
        setNewPage,
        setNewPageSize,
    };
};
