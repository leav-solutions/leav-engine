import {useLazyQuery, useQuery} from '@apollo/client';
import React, {useEffect, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import {Menu} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getLibraryDetailExtendsQuery} from '../../queries/libraries/getLibraryDetailExtendQuery';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '../../queries/records/getRecordsFromLibraryQueryTypes';
import {checkTypeIsLink, localizedLabel} from '../../utils';
import {AttributeFormat, AttributeType, IAttribute, IItem, OrderSearch} from '../../_types/types';
import DisplayTypeSelector from './DisplayTypeSelector';
import Filters from './Filters';
import reducer, {initialState, LibraryItemListReducerActionTypes} from './LibraryItemsListReducer';
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

            const attributes: IAttribute[] = dataLib?.libraries?.list[0]?.attributes.reduce(
                (acc: IAttribute[], attribute) => {
                    if (
                        (attribute.format === null ||
                            (attribute.format && Object.values(AttributeFormat).includes(attribute.format))) &&
                        attribute.type &&
                        Object.values(AttributeType).includes(attribute.type)
                    ) {
                        return [
                            ...acc,
                            {
                                id: attribute.id,
                                type: attribute.type,
                                format: attribute.format,
                                label: attribute.label,
                                isLink: checkTypeIsLink(attribute.type),
                                isMultiple: attribute.multiple_values
                            }
                        ];
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
                itemsSortField: firstAttribute.id,
                itemsSortOrder: OrderSearch.asc,
                attributes
            });

            dispatch({
                type: LibraryItemListReducerActionTypes.SET_COLUMNS,
                columns: []
            });
        }
    }, [dispatch, loadingLib, dataLib]);

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

            const items = itemsFromQuery.map(item => ({
                ...{
                    id: item.whoAmI.id,
                    label: localizedLabel(item.whoAmI.label, lang),
                    color: item.whoAmI.color,
                    preview: item.whoAmI.preview,
                    library: {
                        id: item.whoAmI.library.id,
                        label: item.whoAmI.library.label
                    }
                },
                ...Object.keys(item).reduce((acc, key) => {
                    acc[key] = item[key];
                    return acc;
                }, {})
            }));

            dispatch({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT,
                items: items as IItem[],
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
        <Wrapper showSide={state.showFilters} className={state.showFilters ? 'wrapper-open' : 'wrapper-close'}>
            <Filters stateItems={state} dispatchItems={dispatch} />
            <div className="wrapper-page">
                <Menu style={{height: '5rem'}}>
                    {state.selectionMode ? (
                        <MenuItemListSelected stateItems={state} dispatchItems={dispatch} />
                    ) : (
                        <MenuItemList stateItems={state} dispatchItems={dispatch} refetch={refetch} />
                    )}
                </Menu>

                <DisplayTypeSelector stateItems={state} dispatchItems={dispatch} />
            </div>
        </Wrapper>
    );
}

export default LibraryItemsList;
