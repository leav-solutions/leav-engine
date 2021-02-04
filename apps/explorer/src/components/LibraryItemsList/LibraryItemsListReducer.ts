// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    DisplayListItemTypes,
    IAttribute,
    IItem,
    IItemsColumn,
    IQueryFilter,
    IView,
    OrderSearch,
    TypeSideItem
} from '../../_types/types';

export enum LibraryItemListReducerActionTypes {
    SET_LIB_INFOS = 'SET_LIB_INFOS',
    SET_SEARCH_INFOS = 'SET_SEARCH_INFOS',
    CANCEL_SEARCH = 'CANCEL_SEARCH',
    SET_ITEMS = 'SET_ITEMS',
    SET_ITEMS_AND_TOTAL_COUNT = 'SET_ITEMS_AND_TOTAL_COUNT',
    SET_OFFSET = 'SET_OFFSET',
    SET_PAGINATION = 'SET_PAGINATION',
    SET_DISPLAY_TYPE = 'SET_DISPLAY_TYPE',
    SET_SIDE_ITEMS = 'SET_SIDE_ITEMS',
    SET_SELECTION_MODE = 'SET_SELECTION_MODE',
    SET_ITEMS_SELECTED = 'SET_ITEMS_SELECTED',
    SET_QUERY_FILTERS = 'SET_QUERY_FILTERS',
    SET_ATTRIBUTES = 'SET_ATTRIBUTES',
    SET_COLUMNS = 'SET_COLUMNS',
    SET_ALL_SELECTED = 'SET_ALL_SELECTED',
    SET_ITEM_LOADING = 'SET_ITEM_LOADING',
    SET_SEARCH_FULL_TEXT_ACTIVE = 'SET_SEARCH_FULL_TEXT_ACTIVE',
    SET_VIEW = 'SET_VIEW'
}

export interface ILibraryItemListState {
    itemsSortField: string;
    itemsSortOrder: OrderSearch;
    items?: IItem[];
    itemsTotalCount: number;
    itemsLoading: boolean;
    offset: number;
    pagination: number;
    displayType: DisplayListItemTypes;
    sideItems: {
        visible: boolean;
        type?: TypeSideItem;
    };
    selectionMode: boolean;
    itemsSelected: {[x: string]: boolean};
    queryFilters: IQueryFilter[];
    attributes: IAttribute[];
    columns: IItemsColumn[];
    allSelected: boolean;
    searchFullTextActive: boolean;
    view: {
        current: IView | null;
    };
}

export const LibraryItemListInitialState: ILibraryItemListState = {
    itemsSortField: '',
    itemsSortOrder: OrderSearch.asc,
    itemsTotalCount: 0,
    itemsLoading: false,
    offset: 0,
    pagination: 20,
    displayType: DisplayListItemTypes.listSmall,
    sideItems: {
        visible: false
    },
    selectionMode: false,
    itemsSelected: {},
    queryFilters: [],
    attributes: [],
    columns: [],
    allSelected: false,
    searchFullTextActive: false,
    view: {
        current: null
    }
};

export type LibraryItemListReducerAction =
    | {
          type: LibraryItemListReducerActionTypes.SET_LIB_INFOS;
          itemsSortField: string;
          itemsSortOrder: OrderSearch;
          attributes: IAttribute[];
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SEARCH_INFOS;
          itemsSortField: string;
          itemsSortOrder: OrderSearch;
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
          displayType: DisplayListItemTypes;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SIDE_ITEMS;
          sideItems: {
              visible: boolean;
              type?: TypeSideItem;
          };
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE;
          selectionMode: boolean;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED;
          itemsSelected: {[x: string]: boolean};
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
          type: LibraryItemListReducerActionTypes.SET_COLUMNS;
          columns: IItemsColumn[];
      }
    | {
          type: LibraryItemListReducerActionTypes.CANCEL_SEARCH;
          itemsSortField: string;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ALL_SELECTED;
          allSelected: boolean;
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
      };

const reducer = (state: ILibraryItemListState, action: LibraryItemListReducerAction): ILibraryItemListState => {
    switch (action.type) {
        case LibraryItemListReducerActionTypes.SET_LIB_INFOS:
            return {
                ...state,
                itemsSortField: action.itemsSortField,
                itemsSortOrder: action.itemsSortOrder,
                attributes: action.attributes
            };
        case LibraryItemListReducerActionTypes.SET_SEARCH_INFOS:
            return {...state, itemsSortField: action.itemsSortField, itemsSortOrder: action.itemsSortOrder};
        case LibraryItemListReducerActionTypes.SET_ITEMS:
            return {...state, items: action.items};
        case LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT:
            return {...state, items: action.items, itemsTotalCount: action.totalCount};
        case LibraryItemListReducerActionTypes.SET_OFFSET:
            return {...state, offset: action.offset};
        case LibraryItemListReducerActionTypes.SET_PAGINATION:
            return {...state, pagination: action.pagination};
        case LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE:
            return {...state, displayType: action.displayType};
        case LibraryItemListReducerActionTypes.SET_SIDE_ITEMS:
            return {...state, sideItems: action.sideItems};
        case LibraryItemListReducerActionTypes.SET_SELECTION_MODE:
            return {...state, selectionMode: action.selectionMode};
        case LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED:
            return {...state, itemsSelected: action.itemsSelected};
        case LibraryItemListReducerActionTypes.SET_QUERY_FILTERS:
            return {...state, queryFilters: action.queryFilters};
        case LibraryItemListReducerActionTypes.SET_ATTRIBUTES:
            return {...state, attributes: action.attributes};
        case LibraryItemListReducerActionTypes.SET_COLUMNS:
            return {...state, columns: action.columns};
        case LibraryItemListReducerActionTypes.CANCEL_SEARCH:
            return {...state, itemsSortField: action.itemsSortField, itemsSortOrder: OrderSearch.asc};
        case LibraryItemListReducerActionTypes.SET_ALL_SELECTED:
            const finalState = {...state, allSelected: action.allSelected};
            if (action.allSelected) {
                finalState.itemsSelected = {};
            }
            return finalState;
        case LibraryItemListReducerActionTypes.SET_ITEM_LOADING:
            return {...state, itemsLoading: action.itemLoading};
        case LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE:
            return {...state, searchFullTextActive: action.searchFullTextActive};
        case LibraryItemListReducerActionTypes.SET_VIEW:
            return {...state, view: action.view};
        default:
            return state;
    }
};

export default reducer;
