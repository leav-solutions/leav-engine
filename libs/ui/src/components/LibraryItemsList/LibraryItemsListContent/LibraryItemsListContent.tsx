// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloQueryResult, useQuery} from '@apollo/client';
import {FunctionComponent, useEffect, useMemo, useReducer} from 'react';
import styled, {CSSObject} from 'styled-components';
import {Loading} from '_ui/components';
import {SearchContext} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchContext';
import searchReducer, {
    initialSearchState,
    SearchActionTypes
} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {ISearchRecord} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/_types';
import {useGetRecordUpdatesSubscription, useLang} from '_ui/hooks';
import {IField, IFilter, ISearchSelection, SearchMode} from '_ui/types/search';
import {IView} from '_ui/types/views';
import {useSaveUserDataMutation} from '_ui/_gqlTypes';
import {ILibraryDetailExtended} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import {
    getRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {objectValueVersionToArray} from '_ui/_utils';
import {getRequestFromFilters} from '_ui/_utils/getRequestFromFilter';
import {getSelectedViewKey} from '../constants';
import DisplayTypeSelector from '../DisplayTypeSelector';
import extractAttributesFromLibrary from '../helpers/extractAttributesFromLibrary';
import getFieldFromKey from '../helpers/getFieldFromKey';
import LibraryItemsListEmpty from '../LibraryItemsListEmpty';
import {manageItems} from '../manageItems';
import MenuItemList from '../MenuItemList';
import MenuItemListSelected from '../MenuItemListSelected';
import Sidebar from '../Sidebar';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useKitNotification} from 'aristid-ds';

const MenuWrapper = styled.div`
    border-bottom: 1px solid rgb(235, 237, 240);
    padding: 0 1rem;
    height: 4rem;

    display: flex;
    align-content: center;
    justify-content: space-around;
`;

interface IWrapperProps {
    $showSide: boolean;
    style?: CSSObject;
}

const panelSize = '22.5rem';
const Wrapper = styled.div<IWrapperProps>`
    display: grid;

    ${({$showSide}) =>
        $showSide
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
    library: ILibraryDetailExtended;
    defaultView: IView;
    selectionMode?: boolean;
    style?: CSSObject;
    showTransparency?: boolean;
    mode?: SearchMode;
    onSelectChange?: (selection: ISearchSelection, filters?: IFilter[]) => void;
}

const LibraryItemsListContent: FunctionComponent<ILibraryItemsListContentProps> = ({
    selectionMode,
    library,
    defaultView,
    showTransparency,
    onSelectChange,
    style
}) => {
    const {lang} = useLang();
    const {t} = useSharedTranslation();

    const {kitNotification} = useKitNotification();

    const defaultAttributes = extractAttributesFromLibrary(library);

    const _getFieldsFromView = (view: IView): IField[] =>
        (view.attributes ?? []).reduce((acc, fieldKey) => {
            const field = getFieldFromKey(fieldKey, library, defaultAttributes, lang);
            return field ? [...acc, field] : acc;
        }, []);

    const [searchState, searchDispatch] = useReducer(searchReducer, {
        ...initialSearchState,
        library,
        loading: true,
        attributes: defaultAttributes,
        trees: library.linkedTrees,
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
        valuesVersions: defaultView.valuesVersions,
        showTransparency,
        mode: selectionMode ? SearchMode.select : SearchMode.search
    });

    useGetRecordUpdatesSubscription({libraries: [library.id]});

    const [updateSelectedViewMutation] = useSaveUserDataMutation();
    const selectedViewKey = getSelectedViewKey(library.id);

    const _applyResults = (result: ApolloQueryResult<IGetRecordsFromLibraryQuery>) => {
        const itemsFromQuery = result?.data?.records?.list ?? [];

        const newRecords: ISearchRecord[] = manageItems({
            items: itemsFromQuery,
            fields: searchState.fields
        });

        searchDispatch({
            type: SearchActionTypes.UPDATE_RESULT,
            records: newRecords,
            errors: result?.errors,
            totalCount: result?.data?.records?.totalCount ?? searchState.totalCount
        });
    };

    const _getVersionForRequest = () =>
        searchState.valuesVersions
            ? objectValueVersionToArray(searchState.valuesVersions).filter(v => !!v.treeNodeId)
            : [];

    // We're using a useMemo here to prevent query being fired on every change of searchState.
    // Subsequent search will be triggered on user request and are handled elsewhere.
    // We were previously using the skip property of useQuery but it was causing issues with data update
    const variables = useMemo(
        () => ({
            library: library.id,
            limit: searchState.pagination,
            offset: searchState.offset,
            filters: getRequestFromFilters(searchState.filters),
            sort: searchState.sort?.[0] ?? null,
            fullText: searchState.fullText,
            version: _getVersionForRequest()
        }),
        []
    );

    const getRecordsQueryResult = useQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
        getRecordsFromLibraryQuery(searchState.fields, !searchState.offset),
        {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
            variables
        }
    );
    const {
        loading: getRecordsLoading,
        data: searchData,
        error: searchError,
        called: searchCalled,
        fetchMore: getRecordsFetchMore
    } = getRecordsQueryResult;

    const _fetchRecords = async () => {
        const queryFilters = getRequestFromFilters(searchState.filters);

        const currentVariables = {
            library: library.id,
            limit: searchState.pagination,
            offset: searchState.offset,
            filters: queryFilters,
            sort: searchState.sort?.[0] ?? null,
            fullText: searchState.fullText,
            version: _getVersionForRequest()
        };

        // Records have already been fetched, we use fetchMore to make sure
        // we request the right fields by passing in a whole new query
        const results = await getRecordsFetchMore({
            query: getRecordsFromLibraryQuery(searchState.fields, !searchState.offset),
            variables: currentVariables,
            //@ts-expect-error errorPolicy is applied at runtime even though it's not in the types
            errorPolicy: 'all'
        });

        // We have to call applyResults here because onCompleted is not called when fetchMore is used
        _applyResults(results);
    };

    const isLoading = getRecordsLoading || searchState.view.reload || searchState.loading;

    useEffect(() => {
        if (searchData || searchError) {
            _applyResults(getRecordsQueryResult);
        }
    }, [searchData, searchError]);

    useEffect(() => {
        if (searchState.loading && searchCalled) {
            _fetchRecords();
        }
    }, [searchState.loading]);

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

    /**
     * Calls onSelectChange when selection changes
     */
    useEffect(() => {
        if (!onSelectChange) {
            return;
        }

        onSelectChange(searchState.selection, searchState.selection.allSelected ? searchState.filters : null);
    }, [searchState.selection]);

    const _reload = () => {
        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true});
    };

    const _notifyNewCreation = () => {
        _reload();
        kitNotification.success({
            message: t('items_list.created_in_success.message'),
            description: ''
        });
    };

    // If some elements are selected and the selection type is search, show the selection Menu
    const menuSelectedActive = !!searchState.selection.selected.length || searchState.selection.allSelected;

    return (
        <SearchContext.Provider value={{state: searchState, dispatch: searchDispatch}}>
            <MenuWrapper>
                <MenuItemList refetch={_reload} notifyNewCreation={_notifyNewCreation} library={library} />
                <MenuItemListSelected active={menuSelectedActive} />
            </MenuWrapper>

            <Wrapper
                $showSide={searchState.sideBar.visible}
                className={searchState.sideBar.visible ? 'wrapper-open' : 'wrapper-close'}
                style={style}
            >
                <Sidebar />
                {isLoading && <Loading />}
                {!isLoading &&
                    (!searchState.records.length ? (
                        <LibraryItemsListEmpty notifyNewCreation={_notifyNewCreation} />
                    ) : (
                        <DisplayTypeSelector />
                    ))}
            </Wrapper>
        </SearchContext.Provider>
    );
};

export default LibraryItemsListContent;
