// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {useLang, ErrorDisplay, Loading} from '@leav/ui';
import {getSelectedViewKey, panelSize, viewSettingsField} from 'constants/constants';
import {SelectionModeContext} from 'context';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getRecordsFromLibraryQuery} from 'graphQL/queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from 'graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import {SearchContext} from 'hooks/useSearchReducer/searchContext';
import searchReducer, {initialSearchState, SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {ISearchRecord} from 'hooks/useSearchReducer/_types';
import {useEffect, useReducer} from 'react';
import {useAppSelector} from 'reduxStore/store';
import styled, {CSSObject} from 'styled-components';
import {objectValueVersionToArray} from 'utils';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '_gqlTypes/SAVE_USER_DATA';
import {IField, IView, SharedStateSelectionType} from '_types/types';
import {getRequestFromFilters} from '../../../utils/getRequestFromFilter';
import DisplayTypeSelector from '../DisplayTypeSelector';
import extractAttributesFromLibrary from '../helpers/extractAttributesFromLibrary';
import getFieldFromKey from '../helpers/getFieldFromKey';
import LibraryItemsListEmpty from '../LibraryItemsListEmpty';
import {manageItems} from '../manageItems';
import MenuItemList from '../MenuItemList';
import MenuItemListSelected from '../MenuItemListSelected';
import SideItems from '../SideItems';

const MenuWrapper = styled.div`
    border-bottom: 1px solid rgb(235, 237, 240);
    padding: 0 1rem;
    height: 4rem;

    display: flex;
    align-content: center;
    justify-content: space-around;
`;

interface IWrapperProps {
    showSide: boolean;
    style?: CSSObject;
}

const Wrapper = styled.div<IWrapperProps>`
    display: grid;

    ${({showSide}) =>
        showSide
            ? `
            grid-template-columns: ${panelSize} calc(100% - ${panelSize});
            grid-template-rows: 92% auto;
            grid-template-areas:
                'side data'
                'side pagination';`
            : `
            grid-template-columns: auto;
            grid-template-rows: 92% auto;
            grid-template-areas:
                'data'
                'pagination';`}

    height: calc(100vh - 7rem);
    position: relative;
    overflow: auto;
`;

interface ILibraryItemsListContentProps {
    selectionMode?: boolean;
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list;
    defaultView: IView;
    style?: CSSObject;
}

function LibraryItemsListContent({
    selectionMode,
    library,
    defaultView,
    style
}: ILibraryItemsListContentProps): JSX.Element {
    const {lang} = useLang();
    const {display, selection: selectionState} = useAppSelector(state => state); // keep selection
    const defaultAttributes = extractAttributesFromLibrary(library);

    const _getFieldsFromView = (view: IView): IField[] =>
        !!view.settings?.find(s => s.name === viewSettingsField)
            ? view.settings
                  .find(s => s.name === viewSettingsField)
                  .value.reduce((acc, fieldKey) => {
                      const field = getFieldFromKey(fieldKey, library, defaultAttributes, lang);
                      return field ? [...acc, field] : acc;
                  }, [])
            : [];

    const [searchState, searchDispatch] = useReducer(searchReducer, {
        ...initialSearchState,
        library,
        loading: true,
        attributes: defaultAttributes,
        fields: _getFieldsFromView(defaultView),
        filters: defaultView.filters,
        sort: defaultView.sort,
        display: defaultView.display,
        view: {
            current: defaultView,
            reload: false,
            sync: true
        },
        lang,
        valuesVersions: defaultView.valuesVersions
    });

    const [updateSelectedViewMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);
    const selectedViewKey = getSelectedViewKey(library.id);

    const _applyResults = (data: IGetRecordsFromLibraryQuery) => {
        const itemsFromQuery = data ? data[library.gqlNames.query || ''].list : [];

        const newRecords: ISearchRecord[] = manageItems({
            items: itemsFromQuery,
            fields: searchState.fields
        });

        searchDispatch({
            type: SearchActionTypes.UPDATE_RESULT,
            records: newRecords,
            totalCount: data?.[library.gqlNames.query]?.totalCount ?? searchState.totalCount
        });
    };

    const _getVersionForRequest = () =>
        searchState.valuesVersions
            ? objectValueVersionToArray(searchState.valuesVersions).filter(v => !!v.treeNodeId)
            : [];

    const {error: getRecordsError, loading: getRecordsLoading, fetchMore: getRecordsFetchMore} = useQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery(library.gqlNames.query, searchState.fields, !searchState.offset), {
        fetchPolicy: 'network-only',
        skip: !searchState.loading,
        variables: {
            limit: searchState.pagination,
            offset: searchState.offset,
            filters: getRequestFromFilters(searchState.filters),
            sort: searchState.sort,
            fullText: searchState.fullText,
            version: _getVersionForRequest()
        },
        onCompleted: _applyResults,
        onError: err => {
            searchDispatch({
                type: SearchActionTypes.SET_LOADING,
                loading: false
            });
        }
    });

    const _fetchRecords = async () => {
        try {
            const queryFilters = getRequestFromFilters(searchState.filters);

            const variables = {
                limit: searchState.pagination,
                offset: searchState.offset,
                filters: queryFilters,
                sort: searchState.sort,
                fullText: searchState.fullText,
                version: _getVersionForRequest()
            };

            // Records have already been fetched, we use fetchMore to make sure
            // we request the right fields by passing in a whole new query
            const results = await getRecordsFetchMore({
                query: getRecordsFromLibraryQuery(library.gqlNames.query, searchState.fields, !searchState.offset),
                variables
            });

            const recordsData = results.data;

            // We have to call applyResults here because onCompleted is not called when fetchMore is used
            _applyResults(recordsData);
        } catch (err) {
            searchDispatch({type: SearchActionTypes.SET_LOADING, loading: false});
            // Error is already handled. This try/catch is just to avoid unhandled rejection
        }
    };

    const isLoading = getRecordsLoading || searchState.view.reload || searchState.loading;

    /**
     * Called when current view changes. In charge of refetching record and saving last used view
     */
    useEffect(() => {
        if (!searchState.view.reload) {
            return;
        }

        _fetchRecords();

        updateSelectedViewMutation({
            variables: {
                key: selectedViewKey,
                value: searchState.view.current.id,
                global: false
            }
        });
        searchDispatch({type: SearchActionTypes.SET_VIEW_RELOAD, reload: false});
    }, [selectedViewKey, updateSelectedViewMutation, searchState.view, searchState.fields, searchDispatch, library]);

    const _reload = () => {
        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true});
    };

    // if some elements are selected and the selection type is search, show the selection Menu
    const menuSelectedActive = selectionMode
        ? !!selectionState.searchSelection.selected.length ||
          (selectionState.searchSelection.type === SharedStateSelectionType.search &&
              selectionState.searchSelection.allSelected)
        : !!selectionState.selection.selected.length ||
          (selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected);

    return (
        <SearchContext.Provider value={{state: searchState, dispatch: searchDispatch}}>
            <SelectionModeContext.Provider value={selectionMode}>
                <MenuWrapper>
                    <MenuItemList refetch={_reload} library={library} />
                    <MenuItemListSelected active={menuSelectedActive} />
                </MenuWrapper>

                <Wrapper
                    showSide={display.side.visible}
                    className={display.side.visible ? 'wrapper-open' : 'wrapper-close'}
                    style={style}
                >
                    <SideItems />
                    {isLoading && <Loading />}
                    {!isLoading && getRecordsError && <ErrorDisplay message={getRecordsError.message} />}
                    {!isLoading &&
                        !getRecordsError &&
                        (!searchState.records.length ? <LibraryItemsListEmpty /> : <DisplayTypeSelector />)}
                </Wrapper>
            </SelectionModeContext.Provider>
        </SearchContext.Provider>
    );
}

export default LibraryItemsListContent;
