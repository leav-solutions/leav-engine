import {useLazyQuery, useQuery} from '@apollo/client';
import React, {useEffect, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import styled, {CSSObject} from 'styled-components';
import {StateItemsContext} from '../../Context/StateItemsContext';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getLibraryDetailExtendedQuery} from '../../queries/libraries/getLibraryDetailExtendQuery';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '../../queries/records/getRecordsFromLibraryQueryTypes';
import {checkTypeIsLink, localizedLabel} from '../../utils';
import {AttributeFormat, AttributeType, IAttribute, IItem, OrderSearch} from '../../_types/types';
import DisplayTypeSelector from './DisplayTypeSelector';
import Filters from './Filters';
import reducer, {LibraryItemListInitialState, LibraryItemListReducerActionTypes} from './LibraryItemsListReducer';
import {manageItems} from './manageItems';
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
    padding: 1rem;
`;

const MenuWrapper = styled.div`
    border-bottom: 1px solid rgb(235, 237, 240);
    padding: 0 1rem;
    height: 3rem;
`;

function LibraryItemsList(): JSX.Element {
    const {libId} = useParams<{libId: string}>();

    const [state, dispatch] = useReducer(reducer, LibraryItemListInitialState);

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const {loading: loadingLib, data: dataLib, error: errorLib} = useQuery(getLibraryDetailExtendedQuery, {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loadingLib && dataLib) {
            const {query, type, filter, searchableFields} = dataLib?.libraries?.list[0]?.gqlNames;

            const attributes: IAttribute[] = dataLib?.libraries?.list[0]?.attributes.reduce(
                (acc: IAttribute[], attribute) => {
                    if (
                        (attribute.format === null ||
                            (attribute.format && Object.values(AttributeFormat).includes(attribute.format))) &&
                        attribute.type &&
                        Object.values(AttributeType).includes(attribute.type)
                    ) {
                        const newAttribute: IAttribute = {
                            id: attribute.id,
                            type: attribute.type,
                            format: attribute.format,
                            label: attribute.label,
                            isLink: checkTypeIsLink(attribute.type),
                            isMultiple: attribute.multiple_values,
                            linkedLibrary: attribute.linked_library,
                            linkedTree: attribute.linked_tree,
                            library: libId
                        };

                        return [...acc, newAttribute];
                    }
                    return acc;
                },
                []
            );

            dispatch({
                type: LibraryItemListReducerActionTypes.SET_LIB_INFOS,
                libQuery: query,
                libFilter: filter,
                libGqlType: type,
                libSearchableField: searchableFields,
                itemsSortField: 'id', // force the first sort by id
                itemsSortOrder: OrderSearch.asc,
                attributes
            });

            dispatch({
                type: LibraryItemListReducerActionTypes.SET_COLUMNS,
                columns: []
            });
        }
    }, [dispatch, loadingLib, dataLib, libId]);

    const [
        getRecords,
        {called: calledItem, loading: loadingItem, data: dataItem, error: errorItem, client, refetch}
    ] = useLazyQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
        state.libFilter && state.libQuery && state.libSearchableField
            ? getRecordsFromLibraryQuery(
                  state.libQuery || '',
                  state.libFilter,
                  state.columns.filter(col => state.attributes.find(att => att.id === col.id))
              )
            : getLibraryDetailExtendedQuery,
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
        if (!state.searchFullTextActive) {
            if (!loadingItem && calledItem && dataItem && client && state.libFilter) {
                const itemsFromQuery = dataItem ? dataItem[state.libQuery || ''].list : [];

                const items = manageItems({items: itemsFromQuery, lang, columns: state.columns});

                dispatch({
                    type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT,
                    items: (items as unknown) as IItem[],
                    totalCount: dataItem[state.libQuery]?.totalCount
                });

                dispatch({
                    type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                    itemLoading: false
                });

                const label = dataItem[state.libQuery]?.list[0]?.whoAmI.library.label;

                client.writeQuery({
                    query: getActiveLibrary,
                    data: {
                        activeLib: {
                            id: libId,
                            name: localizedLabel(label, lang),
                            filter: state.libFilter,
                            gql: {
                                query: state.libQuery,
                                type: state.libGqlType
                            }
                        }
                    }
                });
            } else {
                dispatch({
                    type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                    itemLoading: true
                });
            }
        }
    }, [
        loadingItem,
        dataItem,
        calledItem,
        client,
        lang,
        libId,
        state.libQuery,
        state.libFilter,
        state.libGqlType,
        state.attributes,
        state.columns,
        state.searchFullTextActive
    ]);

    useEffect(() => {
        if (!state.searchFullTextActive) {
            getRecords();
        }
    }, [
        state.offset,
        state.pagination,
        state.queryFilters,
        state.itemsSortField,
        state.itemsSortOrder,
        state.searchFullTextActive,
        getRecords
    ]);

    if (errorItem || errorLib) {
        return <div>error</div>;
    }

    return (
        <StateItemsContext.Provider value={{stateItems: state, dispatchItems: dispatch}}>
            <Wrapper showSide={state.showFilters} className={state.showFilters ? 'wrapper-open' : 'wrapper-close'}>
                <Filters stateItems={state} dispatchItems={dispatch} />
                <div style={{maxWidth: state.showFilters ? 'calc(100% - 23rem)' : '100%'}}>
                    <MenuWrapper>
                        {state.selectionMode ? (
                            <MenuItemListSelected stateItems={state} dispatchItems={dispatch} />
                        ) : (
                            <MenuItemList stateItems={state} dispatchItems={dispatch} refetch={refetch} />
                        )}
                    </MenuWrapper>
                    <DisplayTypeSelector stateItems={state} dispatchItems={dispatch} />
                </div>
            </Wrapper>
        </StateItemsContext.Provider>
    );
}

export default LibraryItemsList;
