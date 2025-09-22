// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Dispatch, useState} from 'react';
import {type IViewSettingsAction, ViewSettingsActionTypes} from './manage-view-settings';
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
                pageSize: newPageSize
            }
        });
    };

    return {
        currentPage,
        setNewPage,
        setNewPageSize
    };
};
