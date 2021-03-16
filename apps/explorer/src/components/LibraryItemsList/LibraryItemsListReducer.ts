// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {defaultSort} from '../../constants/constants';
import {
    DisplaySize,
    IAttribute,
    IField,
    IItem,
    IQueryFilter,
    IView,
    OrderSearch,
    TypeSideItem
} from '../../_types/types';

export enum LibraryItemListReducerActionTypes {
    SET_SORT = 'SET_SORT',
    CANCEL_SORT = 'CANCEL_SORT',
    SET_LIB_INFOS = 'SET_LIB_INFOS',
    SET_ITEMS = 'SET_ITEMS',
    SET_ITEMS_AND_TOTAL_COUNT = 'SET_ITEMS_AND_TOTAL_COUNT',
    SET_OFFSET = 'SET_OFFSET',
    SET_PAGINATION = 'SET_PAGINATION',
    SET_DISPLAY_TYPE = 'SET_DISPLAY_TYPE',
    SET_SIDE_ITEMS = 'SET_SIDE_ITEMS',
    SET_QUERY_FILTERS = 'SET_QUERY_FILTERS',
    SET_ATTRIBUTES = 'SET_ATTRIBUTES',
    SET_FIELDS = 'SET_FIELDS',
    SET_ITEM_LOADING = 'SET_ITEM_LOADING',
    SET_SEARCH_FULL_TEXT_ACTIVE = 'SET_SEARCH_FULL_TEXT_ACTIVE',
    SET_VIEW = 'SET_VIEW',
    SET_RELOAD_VIEW = 'SET_RELOAD_VIEW'
}

interface IItemsSort {
    field: string;
    order: OrderSearch;
    active: boolean;
}
export interface ILibraryItemListState {
    itemsSort: IItemsSort;
    items?: IItem[];
    itemsTotalCount: number;
    itemsLoading: boolean;
    offset: number;
    pagination: number;
    displaySize: DisplaySize;
    sideItems: {
        visible: boolean;
        type?: TypeSideItem;
    };
    queryFilters: IQueryFilter[];
    attributes: IAttribute[];
    fields: IField[];
    searchFullTextActive: boolean;
    view: {
        current: IView | null;
        reload: boolean;
    };
}

export const LibraryItemListInitialState: ILibraryItemListState = {
    itemsSort: {
        field: '',
        order: OrderSearch.asc,
        active: false
    },
    itemsTotalCount: 0,
    itemsLoading: false,
    offset: 0,
    pagination: 20,
    displaySize: DisplaySize.small,
    sideItems: {
        visible: false
    },
    queryFilters: [],
    attributes: [],
    fields: [],
    searchFullTextActive: false,
    view: {
        current: null,
        reload: false
    }
};

export type LibraryItemListReducerAction =
    | {
          type: LibraryItemListReducerActionTypes.SET_LIB_INFOS;
          itemsSort: IItemsSort;
          attributes: IAttribute[];
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SORT;
          itemsSort: IItemsSort;
      }
    | {
          type: LibraryItemListReducerActionTypes.CANCEL_SORT;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ITEMS;
          items: IItem[];
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT;
          items: IItem[];
          totalCount: number;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_OFFSET;
          offset: number;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_PAGINATION;
          pagination: number;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE;
          displayType: DisplaySize;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SIDE_ITEMS;
          sideItems: {
              visible: boolean;
              type?: TypeSideItem;
          };
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS;
          queryFilters: IQueryFilter[];
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ATTRIBUTES;
          attributes: IAttribute[];
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_FIELDS;
          fields: IField[];
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING;
          itemLoading: boolean;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE;
          searchFullTextActive: boolean;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_VIEW;
          view: {
              current: IView | null;
          };
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_RELOAD_VIEW;
          reload: boolean;
      };

const reducer = (state: ILibraryItemListState, action: LibraryItemListReducerAction): ILibraryItemListState => {
    switch (action.type) {
        case LibraryItemListReducerActionTypes.SET_LIB_INFOS:
            return {
                ...state,
                itemsSort: action.itemsSort,
                attributes: action.attributes
            };
        case LibraryItemListReducerActionTypes.SET_SORT:
            return {...state, itemsSort: action.itemsSort};
        case LibraryItemListReducerActionTypes.CANCEL_SORT:
            // set sort to default value
            const itemsSort: IItemsSort = {...defaultSort, active: false};
            return {...state, itemsSort};
        case LibraryItemListReducerActionTypes.SET_ITEMS:
            return {...state, items: action.items};
        case LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT:
            return {...state, items: action.items, itemsTotalCount: action.totalCount};
        case LibraryItemListReducerActionTypes.SET_OFFSET:
            return {...state, offset: action.offset};
        case LibraryItemListReducerActionTypes.SET_PAGINATION:
            return {...state, pagination: action.pagination};
        case LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE:
            return {...state, displaySize: action.displayType};
        case LibraryItemListReducerActionTypes.SET_SIDE_ITEMS:
            return {...state, sideItems: action.sideItems};
        case LibraryItemListReducerActionTypes.SET_QUERY_FILTERS:
            return {...state, queryFilters: action.queryFilters};
        case LibraryItemListReducerActionTypes.SET_ATTRIBUTES:
            return {...state, attributes: action.attributes};
        case LibraryItemListReducerActionTypes.SET_FIELDS:
            return {...state, fields: action.fields};
        case LibraryItemListReducerActionTypes.SET_ITEM_LOADING:
            return {...state, itemsLoading: action.itemLoading};
        case LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE:
            return {...state, searchFullTextActive: action.searchFullTextActive};
        case LibraryItemListReducerActionTypes.SET_VIEW:
            return {...state, view: {...state.view, ...action.view}};
        case LibraryItemListReducerActionTypes.SET_RELOAD_VIEW:
            return {...state, view: {...state.view, reload: action.reload}};
        default:
            return state;
    }
};

// Actions

export const applySort = (field: string, order: OrderSearch): LibraryItemListReducerAction => ({
    type: LibraryItemListReducerActionTypes.SET_SORT,
    itemsSort: {
        field,
        order,
        active: true
    }
});

export default reducer;
