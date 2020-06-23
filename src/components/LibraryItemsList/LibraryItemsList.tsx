import {useLazyQuery, useQuery} from '@apollo/client';
import React, {useEffect, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import {Menu} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getLibraryDetailExtendsQuery} from '../../queries/libraries/getLibraryDetailExtendQuery';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {localizedLabel} from '../../utils';
import {displayListItemTypes, IItem, orderSearch} from '../../_types/types';
import Filters from './Filters';
import ItemsTitleDisplay from './ItemsTitleDisplay';
import reducer, {initialState, LibraryItemListReducerActionTypes} from './LibraryItemsListReducer';
import LibraryItemsListTable from './LibraryItemsListTable';
import MenuItemList from './MenuItemList';
import MenuItemListSelected from './MenuItemListSelected';

interface IWrapperProps {
    showSide: boolean;
    style?: CSSObject;
}

const Wrapper = styled.div<IWrapperProps>`
    display: ${({showSide}) => (showSide ? 'grid' : 'inherit')};
    grid-template-columns: 25rem auto;
    grid-template-rows: 100%;
    height: 100%;
`;

function LibraryItemsList(): JSX.Element {
    const {libId} = useParams();

    const [state, dispatch] = useReducer(reducer, initialState);

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const {loading: loadingLib, data: dataLib, error: errorLib} = useQuery(getLibraryDetailExtendsQuery, {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loadingLib) {
            const {query, filter, searchableFields} = dataLib?.libraries?.list[0]?.gqlNames;
            const firstAttribute = dataLib?.libraries?.list[0]?.attributes[0];
            dispatch({
                type: LibraryItemListReducerActionTypes.SET_LIB_INFOS,
                libQuery: query,
                libFilter: filter,
                libSearchableField: searchableFields,
                itemsSortField: firstAttribute.id,
                itemsSortOrder: orderSearch.asc
            });
        }
    }, [dispatch, loadingLib, dataLib]);

    const [
        getRecord,
        {called: calledItem, loading: loadingItem, data: dataItem, error: errorItem, client, refetch}
    ] = useLazyQuery(
        state.libFilter && state.libQuery && state.libSearchableField
            ? getRecordsFromLibraryQuery(state.libQuery || '', state.libFilter, state.libSearchableField)
            : getLibraryDetailExtendsQuery,
        {
            variables: {
                limit: state.pagination,
                offset: state.offset,
                filters: state.queryFilters,
                sortField: state.itemsSortField,
                sortOrder: state.itemsSortOrder
            }
        }
    );

    useEffect(() => {
        if (!loadingItem && calledItem && dataItem && client && state.libFilter) {
            const itemsFromQuery = dataItem ? dataItem[state.libQuery || ''].list : [];

            dispatch({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT,
                items: itemsFromQuery.map((i: any) => i.whoAmI) as IItem[],
                totalCount: dataItem[state.libQuery]?.totalCount
            });

            const label = dataItem[state.libQuery]?.list[0]?.whoAmI.library.label;

            client.writeQuery({
                query: getActiveLibrary,
                data: {
                    activeLibId: libId,
                    activeLibQueryName: state.libQuery,
                    activeLibName: localizedLabel(label, lang),
                    activeLibFilterName: state.libFilter
                }
            });
        }
    }, [loadingItem, dataItem, calledItem, client, lang, libId, state.libQuery, state.libFilter]);

    useEffect(() => {
        getRecord();
    }, [state.offset, state.pagination, state.queryFilters, state.itemsSortField, state.itemsSortOrder, getRecord]);

    if (errorItem || errorLib) {
        return <div>error</div>;
    }

    return (
        <Wrapper showSide={state.showFilters}>
            <Filters stateItems={state} dispatchItems={dispatch} libId={libId} libQueryName={state.libQuery} />
            <div className="wrapper-page">
                <Menu style={{height: '5rem'}}>
                    {state.selectionMode ? (
                        <MenuItemListSelected stateItems={state} dispatchItems={dispatch} />
                    ) : (
                        <MenuItemList stateItems={state} dispatchItems={dispatch} refetch={refetch} />
                    )}
                </Menu>

                {state.displayType === displayListItemTypes.listMedium && (
                    <LibraryItemsListTable stateItems={state} dispatchItems={dispatch} />
                )}
                {state.displayType === displayListItemTypes.tile && (
                    <ItemsTitleDisplay stateItems={state} dispatchItems={dispatch} />
                )}
            </div>
        </Wrapper>
    );
}

export default LibraryItemsList;
