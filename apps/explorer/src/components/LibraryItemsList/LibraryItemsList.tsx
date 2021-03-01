// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useQuery} from '@apollo/client';
import {setFilters, setQueryFilters} from 'hooks/FiltersStateHook/FilterReducerAction';
import useStateFilters from 'hooks/FiltersStateHook/FiltersStateHook';
import {isString} from 'lodash';
import React, {useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled, {CSSObject} from 'styled-components';
import {attributeExtendedKey, defaultSort, defaultView, panelSize, viewSettingsField} from '../../constants/constants';
import {StateItemsContext} from '../../Context/StateItemsContext';
import {useActiveLibrary} from '../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../hooks/LangHook/LangHook';
import {useNotifications} from '../../hooks/NotificationsHook/NotificationsHook';
import {
    getLibraryDetailExtendedQuery,
    IGetLibraryDetailExtendedQuery,
    IGetLibraryDetailExtendedVariables
} from '../../queries/libraries/getLibraryDetailExtendQuery';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '../../queries/records/getRecordsFromLibraryQueryTypes';
import {checkTypeIsLink, getAttributeFromKey, localizedLabel} from '../../utils';
import {
    AttributeFormat,
    AttributeType,
    IAttribute,
    IField,
    IItem,
    IParentAttributeData,
    IView,
    NotificationType,
    ViewType
} from '../../_types/types';
import DisplayTypeSelector from './DisplayTypeSelector';
import {getFiltersFromRequest} from './FiltersPanel/getFiltersFromRequest';
import reducer, {
    applySort,
    LibraryItemListInitialState,
    LibraryItemListReducerActionTypes
} from './LibraryItemsListReducer';
import {manageItems} from './manageItems';
import MenuItemList from './MenuItemList';
import MenuItemListSelected from './MenuItemListSelected';
import SideItems from './SideItems';

interface IWrapperProps {
    showSide: boolean;
    style?: CSSObject;
}

const Wrapper = styled.div<IWrapperProps>`
    display: ${({showSide}) => (showSide ? 'grid' : 'inherit')};
    grid-template-columns: ${panelSize} calc(100% - ${panelSize});
    grid-template-rows: 100%;
    height: 100%;
    position: relative;
`;

const MenuWrapper = styled.div`
    border-bottom: 1px solid rgb(235, 237, 240);
    padding: 0 1rem;
    height: 4rem;

    display: flex;
    align-content: center;
    justify-content: space-around;
`;

function LibraryItemsList(): JSX.Element {
    const {t} = useTranslation();
    const {libId} = useParams<{libId: string}>();

    const [stateItems, dispatchItems] = useReducer(reducer, LibraryItemListInitialState);
    const [stateFilters, dispatchFilters] = useStateFilters();

    const [{lang}] = useLang();
    const {updateBaseNotification} = useNotifications();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();

    const {loading, data, error} = useQuery<IGetLibraryDetailExtendedQuery, IGetLibraryDetailExtendedVariables>(
        getLibraryDetailExtendedQuery,
        {
            variables: {
                libId
            }
        }
    );

    useEffect(() => {
        if (!loading && data) {
            const currentLibrary = data.libraries?.list[0];

            const currentLibId = currentLibrary?.id;
            const currentLibLabel = currentLibrary?.label;
            const {query, type, filter, searchableFields} = currentLibrary?.gqlNames;
            const currentLibName = localizedLabel(currentLibLabel, lang);

            // Active Library
            updateActiveLibrary({
                id: currentLibId,
                name: currentLibName,
                filter,
                gql: {
                    searchableFields,
                    query,
                    type
                }
            });

            // Base Notification
            updateBaseNotification({
                content: t('notification.active-lib', {lib: currentLibName}),
                type: NotificationType.basic
            });

            // Current View
            let view: IView | undefined;
            if (currentLibrary.defaultView) {
                view = {
                    id: currentLibrary.defaultView.id,
                    label: localizedLabel(currentLibrary.defaultView.label, lang),
                    description: currentLibrary.defaultView.description,
                    type: currentLibrary.defaultView.type,
                    color: currentLibrary.defaultView.color,
                    shared: currentLibrary.defaultView.shared,
                    fields:
                        currentLibrary.defaultView.settings?.find(setting => setting.name === viewSettingsField)
                            ?.value ?? [],
                    filters: currentLibrary.defaultView.filters,
                    sort: currentLibrary.defaultView.sort
                };
            } else {
                // use defaultView and translate label
                view = {...defaultView, label: t(defaultView.label)};
            }

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_VIEW,
                view: {current: view}
            });

            // Attributes
            const attributes: IAttribute[] = data?.libraries?.list[0]?.attributes.reduce(
                (acc: IAttribute[], attribute) => {
                    if (
                        (attribute.format === null ||
                            (attribute.format && Object.values(AttributeFormat).includes(attribute.format))) &&
                        attribute.type &&
                        Object.values(AttributeType).includes(attribute.type)
                    ) {
                        const newAttributes: IAttribute[] = [
                            {
                                id: attribute.id,
                                type: attribute.type,
                                format: attribute.format,
                                label: attribute.label,
                                isLink: checkTypeIsLink(attribute.type),
                                isMultiple: attribute.multiple_values,
                                linkedLibrary: attribute.linked_library,
                                linkedTree: attribute.linked_tree,
                                library: currentLibId
                            }
                        ];

                        // case attribute is a linked attribute
                        if (
                            (attribute.type === AttributeType.simple_link ||
                                attribute.type === AttributeType.advanced_link) &&
                            attribute.linked_library
                        ) {
                            const linkedLibraryId = attribute.linked_library.id;
                            const newLinkedAttributes: IAttribute[] = attribute.linked_library.attributes.map(
                                linkedAttribute => ({
                                    id: linkedAttribute.id,
                                    type: linkedAttribute.type,
                                    format: linkedAttribute.format,
                                    label: linkedAttribute.label,
                                    isLink: checkTypeIsLink(linkedAttribute.type),
                                    isMultiple: linkedAttribute.multiple_values,
                                    library: linkedLibraryId
                                })
                            );

                            newAttributes.push(...newLinkedAttributes);
                        }

                        if (attribute.type === AttributeType.tree && attribute.linked_tree) {
                            const newLinkedAttributes: IAttribute[] = attribute.linked_tree.libraries
                                .map(linkedTreeLibrary => {
                                    const linkedLibraryId = linkedTreeLibrary.library.id;
                                    return linkedTreeLibrary.library.attributes.map(linkedAttribute => ({
                                        id: linkedAttribute.id,
                                        type: linkedAttribute.type,
                                        format: linkedAttribute.format,
                                        label: linkedAttribute.label,
                                        isLink: checkTypeIsLink(linkedAttribute.type),
                                        isMultiple: linkedAttribute.multiple_values,
                                        library: linkedLibraryId
                                    }));
                                })
                                .flat();

                            newAttributes.push(...newLinkedAttributes);
                        }

                        return [...acc, ...newAttributes];
                    }

                    return acc;
                },
                []
            );

            // force the first sort by id
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_LIB_INFOS,
                itemsSort: {
                    ...view.sort,
                    active: false
                },
                attributes
            });
        }
    }, [dispatchItems, updateActiveLibrary, updateBaseNotification, t, loading, data, libId, activeLibrary, lang]);

    useEffect(() => {
        if (stateItems.view.reload && stateItems.view.current) {
            if (stateItems.view.current.type === ViewType.list) {
                // Get initials Fields
                const fields = stateItems.view.current.fields?.reduce((acc, fieldKey) => {
                    let parentAttributeData: IParentAttributeData | undefined;

                    const splitKey = fieldKey.split('.');

                    const attribute = getAttributeFromKey(fieldKey, stateItems.attributes);

                    // get originAttribute
                    if (splitKey.length === 3 && splitKey[0] !== attributeExtendedKey) {
                        const parentAttributeId = splitKey[1];
                        const parentAttribute = stateItems.attributes.find(
                            att => parentAttributeId === att.id && activeLibrary?.id === att.library
                        );

                        if (parentAttribute) {
                            parentAttributeData = {
                                id: parentAttribute.id,
                                type: parentAttribute.type
                            };
                        }
                    }

                    if (!attribute) {
                        return acc;
                    }

                    const label = isString(attribute.label) ? attribute.label : localizedLabel(attribute.label, lang);

                    const field: IField = {
                        key: fieldKey,
                        id: attribute.id,
                        library: attribute.library,
                        label,
                        format: attribute.format,
                        type: attribute.type,
                        parentAttributeData
                    };

                    return [...acc, field];
                }, [] as IField[]);

                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_FIELDS,
                    fields: fields ?? []
                });
            }

            // update Filters
            if (stateItems.view.current.filters) {
                dispatchFilters(
                    setFilters(getFiltersFromRequest(stateItems.view.current.filters, stateItems.attributes))
                );
                dispatchFilters(setQueryFilters(stateItems.view.current.filters));
            } else {
                // reset filters
                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
                    queryFilters: []
                });
            }

            // update sort
            const field = stateItems.view.current.sort?.field ?? defaultSort.field;
            const order = stateItems.view.current.sort?.order ?? defaultSort.order;
            dispatchItems(applySort(field, order));
        }
    }, [stateItems.view, stateItems.attributes, lang, activeLibrary, dispatchFilters]);

    // Get data
    const [
        getRecords,
        {called: calledItem, loading: loadingItem, data: dataItem, error: errorItem, refetch}
    ] = useLazyQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
        getRecordsFromLibraryQuery(activeLibrary?.gql.query, stateItems.fields),
        {
            variables: {
                limit: stateItems.pagination,
                offset: stateItems.offset,
                filters: stateFilters.queryFilters,
                sortField: stateItems.itemsSort.field ?? defaultSort.field,
                sortOrder: stateItems.itemsSort.order ?? defaultSort.order
            }
        }
    );

    useEffect(() => {
        if (!stateItems.searchFullTextActive) {
            if (!loadingItem && calledItem && dataItem && activeLibrary?.filter) {
                const libQuery = activeLibrary.gql.query;

                const itemsFromQuery = dataItem ? dataItem[activeLibrary.gql.query || ''].list : [];

                const items: IItem[] = manageItems({items: itemsFromQuery, lang, fields: stateItems.fields});

                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT,
                    items,
                    totalCount: dataItem[libQuery]?.totalCount
                });

                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                    itemLoading: false
                });
            } else {
                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                    itemLoading: false
                });
            }
        }
    }, [
        loadingItem,
        dataItem,
        calledItem,
        lang,
        libId,
        activeLibrary,
        stateItems.attributes,
        stateItems.fields,
        stateItems.searchFullTextActive
    ]);

    useEffect(() => {
        if (!stateItems.searchFullTextActive && activeLibrary?.gql.query) {
            getRecords();
        }
    }, [
        stateItems.offset,
        stateItems.pagination,
        stateItems.queryFilters,
        stateItems.itemsSort,
        stateItems.searchFullTextActive,
        stateItems.view.reload,
        activeLibrary,
        getRecords
    ]);

    if (errorItem || error) {
        return <div>error</div>;
    }

    return (
        <StateItemsContext.Provider value={{stateItems, dispatchItems}}>
            <MenuWrapper>
                <MenuItemList refetch={refetch} />
                <MenuItemListSelected active={stateItems.selectionMode} />
            </MenuWrapper>

            <Wrapper
                showSide={stateItems.sideItems.visible}
                className={stateItems.sideItems.visible ? 'wrapper-open' : 'wrapper-close'}
            >
                <SideItems />
                <DisplayTypeSelector />
            </Wrapper>
        </StateItemsContext.Provider>
    );
}

export default LibraryItemsList;
