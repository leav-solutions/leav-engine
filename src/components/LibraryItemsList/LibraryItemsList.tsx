import {useLazyQuery, useQuery} from '@apollo/client';
import React, {useEffect, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import styled, {CSSObject} from 'styled-components';
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
    const {libId} = useParams();

    const [state, dispatch] = useReducer(reducer, LibraryItemListInitialState);

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const {loading: loadingLib, data: dataLib, error: errorLib} = useQuery(getLibraryDetailExtendedQuery, {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loadingLib) {
            const {query, filter, searchableFields} = dataLib?.libraries?.list[0]?.gqlNames;

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
        getRecord,
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
        if (!loadingItem && calledItem && dataItem && client && state.libFilter) {
            const itemsFromQuery = dataItem ? dataItem[state.libQuery || ''].list : [];

            const items = itemsFromQuery.map(item => {
                return {
                    ...{
                        id: item.whoAmI.id,
                        label:
                            typeof item.whoAmI.label === 'string'
                                ? item.whoAmI.label
                                : localizedLabel(item.whoAmI.label, lang),
                        color: item.whoAmI.color,
                        preview: item.whoAmI.preview,
                        library: {
                            id: item.whoAmI.library.id,
                            label: item.whoAmI.library.label
                        }
                    },
                    ...state.columns.reduce((acc, col) => {
                        const key: string = `${col.library}_${col.id}`;

                        if (col?.originAttributeData && item[col.originAttributeData.id]) {
                            if (col.originAttributeData.type === AttributeType.tree) {
                                // linked tree
                                let value = item[col.originAttributeData.id].map(tree => tree.record[col.id]);

                                if (Array.isArray(value)) {
                                    value = value.shift();
                                }

                                acc[key] = value;
                            } else {
                                // linked attribute
                                acc[key] = item[col.originAttributeData.id][col.id];
                            }
                        } else if (item.whoAmI.library.id === col.library && item[col.id]) {
                            // basic case
                            acc[key] = item[col.id];
                        }
                        return acc;
                    }, {})
                };
            });

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
                    activeLibId: libId,
                    activeLibQueryName: state.libQuery,
                    activeLibName: localizedLabel(label, lang),
                    activeLibFilterName: state.libFilter
                }
            });
        } else {
            dispatch({
                type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                itemLoading: true
            });
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
        state.attributes,
        state.columns
    ]);

    useEffect(() => {
        getRecord();
    }, [state.offset, state.pagination, state.queryFilters, state.itemsSortField, state.itemsSortOrder, getRecord]);

    if (errorItem || errorLib) {
        return <div>error</div>;
    }

    return (
        <Wrapper showSide={state.showFilters} className={state.showFilters ? 'wrapper-open' : 'wrapper-close'}>
            <Filters stateItems={state} dispatchItems={dispatch} />
            <div>
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
    );
}

export default LibraryItemsList;
