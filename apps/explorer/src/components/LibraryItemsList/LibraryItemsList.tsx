// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useQuery} from '@apollo/client';
import {setFilters, setQueryFilters} from 'hooks/FiltersStateHook/FilterReducerAction';
import useStateFilters from 'hooks/FiltersStateHook/FiltersStateHook';
import {isString} from 'lodash';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {setAttributes} from 'redux/attributes';
import {setDisplaySelectionMode} from 'redux/display';
import {setFields} from 'redux/fields';
import {setFiltersQueryFilters} from 'redux/filters';
import {setItems, setItemsLoading, setItemsSort, setItemsTotalCount} from 'redux/items';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {setViewCurrent} from 'redux/view';
import styled, {CSSObject} from 'styled-components';
import {attributeExtendedKey, defaultSort, defaultView, panelSize, viewSettingsField} from '../../constants/constants';
import {
    getLibraryDetailExtendedQuery,
    IGetLibraryDetailExtendedQuery,
    IGetLibraryDetailExtendedVariables
} from '../../graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {getRecordsFromLibraryQuery} from '../../graphQL/queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '../../graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import {useActiveLibrary} from '../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../hooks/LangHook/LangHook';
import {checkTypeIsLink, getAttributeFromKey, localizedLabel} from '../../utils';
import {
    AttributeFormat,
    AttributeType,
    IAttribute,
    IBaseNotification,
    IField,
    IItem,
    IParentAttributeData,
    IView,
    NotificationType,
    SharedStateSelectionType,
    ViewType
} from '../../_types/types';
import DisplayTypeSelector from './DisplayTypeSelector';
import {getFiltersFromRequest} from './FiltersPanel/getFiltersFromRequest';
import {manageItems} from './manageItems';
import MenuItemList from './MenuItemList';
import MenuItemListSelected from './MenuItemListSelected';
import SideItems from './SideItems';

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
    height: calc(100% - 4rem);
    position: relative;
    overflow: hidden;
`;

const MenuWrapper = styled.div`
    border-bottom: 1px solid rgb(235, 237, 240);
    padding: 0 1rem;
    height: 4rem;

    display: flex;
    align-content: center;
    justify-content: space-around;
`;

interface ILibraryItemsList {
    selectionMode?: boolean;
    libId?: string;
}

function LibraryItemsList({selectionMode, libId: givenLibId}: ILibraryItemsList): JSX.Element {
    const {t} = useTranslation();
    const {libId: urlLibId} = useParams<{libId: string}>();

    const libId = givenLibId ?? urlLibId;

    const {items, view, filters, attributes, display, fields, selection: selectionState, notification} = useAppSelector(
        state => state
    );
    const dispatch = useAppDispatch();

    const {stateFilters, dispatchFilters} = useStateFilters();
    const [{lang}] = useLang();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();

    useEffect(() => {
        dispatch(setDisplaySelectionMode(!!selectionMode));
    }, [dispatch, selectionMode]);

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
            if (activeLibrary.id !== currentLibId) {
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
            }

            // Base Notification
            if (
                !display.selectionMode &&
                notification.base.content !== t('notification.active-lib', {lib: currentLibName})
            ) {
                const baseNotification: IBaseNotification = {
                    content: t('notification.active-lib', {lib: currentLibName}),
                    type: NotificationType.basic
                };
                dispatch(setNotificationBase(baseNotification));
            }

            // Current View
            let newView: IView | undefined;
            if (currentLibrary.defaultView) {
                newView = {
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
                newView = {...defaultView, label: t(defaultView.label)};
            }

            dispatch(setViewCurrent(newView));

            // Attributes
            const attributesFromQuery: IAttribute[] = data?.libraries?.list[0]?.attributes.reduce(
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
            dispatch(setItemsSort({...newView.sort, active: false}));
            dispatch(setAttributes(attributesFromQuery));
        }
    }, [
        dispatch,
        notification.base,
        updateActiveLibrary,
        display.selectionMode,
        t,
        loading,
        data,
        libId,
        activeLibrary,
        lang
    ]);

    useEffect(() => {
        if (view.reload && view.current) {
            if (view.current.type === ViewType.list) {
                // Get initials Fields
                const newFields = view.current.fields?.reduce((acc, fieldKey) => {
                    let parentAttributeData: IParentAttributeData | undefined;

                    const splitKey = fieldKey.split('.');

                    const attribute = getAttributeFromKey(fieldKey, attributes.attributes);

                    // get originAttribute
                    if (splitKey.length === 3 && splitKey[0] !== attributeExtendedKey) {
                        const parentAttributeId = splitKey[1];
                        const parentAttribute = attributes.attributes.find(
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

                dispatch(setFields(newFields));
            }

            // update Filters
            if (view.current.filters) {
                dispatchFilters(setFilters(getFiltersFromRequest(view.current.filters, attributes.attributes)));
                dispatchFilters(setQueryFilters(view.current.filters));
            } else {
                // reset filters
                dispatch(setFiltersQueryFilters([]));
            }

            // update sort
            const field = view.current.sort?.field ?? defaultSort.field;
            const order = view.current.sort?.order ?? defaultSort.order;
            dispatch(
                setItemsSort({
                    field,
                    order,
                    active: true
                })
            );
        }
    }, [view, attributes, lang, activeLibrary, dispatchFilters, dispatch]);

    // Get data
    const [
        getRecords,
        {called: calledItem, loading: loadingItem, data: dataItem, error: errorItem, refetch}
    ] = useLazyQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
        getRecordsFromLibraryQuery(activeLibrary?.gql.query, fields.fields),
        {
            variables: {
                limit: items.pagination,
                offset: items.offset,
                filters: stateFilters.queryFilters,
                sortField: items.sort?.field ?? defaultSort.field,
                sortOrder: items.sort?.order ?? defaultSort.order
            }
        }
    );

    useEffect(() => {
        if (!filters.searchFullTextActive) {
            if (!loadingItem && calledItem && dataItem && activeLibrary?.filter) {
                const libQuery = activeLibrary.gql.query;

                const itemsFromQuery = dataItem ? dataItem[activeLibrary.gql.query || ''].list : [];

                const newItems: IItem[] = manageItems({items: itemsFromQuery, lang, fields: fields.fields});

                dispatch(setItemsTotalCount(dataItem[libQuery]?.totalCount));
                dispatch(setItems(newItems));
                dispatch(setItemsLoading(false));
            } else {
                dispatch(setItemsLoading(false));
            }
        }
    }, [
        loadingItem,
        dataItem,
        calledItem,
        lang,
        libId,
        activeLibrary,
        attributes,
        fields,
        filters.searchFullTextActive,
        dispatch
    ]);

    useEffect(() => {
        if (!filters.searchFullTextActive && activeLibrary?.gql.query) {
            getRecords();
        }
    }, [items, view.reload, filters, activeLibrary, getRecords]);

    if (errorItem || error) {
        return <div>error</div>;
    }

    // if some elements are selected and the selection type is search, show the selection Menu
    const menuSelectedActive = display.selectionMode
        ? !!selectionState.searchSelection.selected.length ||
          (selectionState.searchSelection.type === SharedStateSelectionType.search &&
              selectionState.searchSelection.allSelected)
        : !!selectionState.selection.selected.length ||
          (selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected);

    return (
        <>
            <MenuWrapper>
                <MenuItemList refetch={refetch} />
                <MenuItemListSelected active={menuSelectedActive} />
            </MenuWrapper>

            <Wrapper
                showSide={display.side.visible}
                className={display.side.visible ? 'wrapper-open' : 'wrapper-close'}
            >
                <SideItems />
                <DisplayTypeSelector />
            </Wrapper>
        </>
    );
}

export default LibraryItemsList;
