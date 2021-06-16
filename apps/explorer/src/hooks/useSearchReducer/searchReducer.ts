// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {defaultSort} from 'constants/constants';
import {IAttribute, IField} from '_types/types';
import {ISearchRecord, ISearchSort, ISearchState} from './_types';

export enum SearchActionTypes {
    SET_RECORDS = 'SET_RECORDS',
    SET_TOTAL_COUNT = 'SET_TOTAL_COUNT',
    SET_PAGINATION = 'SET_PAGINATION',
    SET_OFFSET = 'SET_OFFSET',
    SET_LOADING = 'SET_LOADING',
    SET_SORT = 'SET_SORT',
    CANCEL_SORT = 'CANCEL_SORT',
    SET_ATTRIBUTES = 'SET_ATTRIBUTES',
    SET_FIELDS = 'SET_FIELDS'
}

export type SearchAction =
    | {type: SearchActionTypes.SET_RECORDS; records: ISearchRecord[]}
    | {type: SearchActionTypes.SET_TOTAL_COUNT; totalCount: number}
    | {type: SearchActionTypes.SET_PAGINATION; page: number}
    | {type: SearchActionTypes.SET_OFFSET; offset: number}
    | {type: SearchActionTypes.SET_LOADING; loading: boolean}
    | {type: SearchActionTypes.SET_SORT; sort: ISearchSort}
    | {type: SearchActionTypes.CANCEL_SORT}
    | {type: SearchActionTypes.SET_ATTRIBUTES; attributes: IAttribute[]}
    | {type: SearchActionTypes.SET_FIELDS; fields: IField[]};

export const initialSearchState: ISearchState = {
    library: null,
    records: [],
    totalCount: 0,
    loading: false,
    pagination: 20,
    offset: 0,
    sort: {...defaultSort, active: false},
    attributes: [],
    fields: []
};

const searchReducer = (state: ISearchState, action: SearchAction): ISearchState => {
    switch (action.type) {
        case SearchActionTypes.SET_RECORDS:
            return {...state, records: action.records};
        case SearchActionTypes.SET_TOTAL_COUNT:
            return {...state, totalCount: action.totalCount};
        case SearchActionTypes.SET_PAGINATION:
            return {...state, pagination: action.page};
        case SearchActionTypes.SET_OFFSET:
            return {...state, offset: action.offset};
        case SearchActionTypes.SET_LOADING:
            return {...state, loading: action.loading};
        case SearchActionTypes.SET_SORT:
            return {...state, sort: action.sort};
        case SearchActionTypes.CANCEL_SORT:
            return {...state, sort: {...defaultSort, active: false}};
        case SearchActionTypes.SET_ATTRIBUTES:
            return {...state, attributes: action.attributes};
        case SearchActionTypes.SET_FIELDS:
            return {...state, fields: action.fields};
    }
};

export default searchReducer;
