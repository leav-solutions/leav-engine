// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_TREES_trees_list_libraries} from '_gqlTypes/GET_TREES';

export const LIBRARY_DND_TYPE = 'library';
export const ROOT_ID = '__root__';
export const ALLOW_ALL_ID = '__all__';

export interface IDndLibraryItem {
    type: string;
    from: string;
    library: GET_TREES_trees_list_libraries;
}

export interface IDndDropResult {
    id: string;
}
