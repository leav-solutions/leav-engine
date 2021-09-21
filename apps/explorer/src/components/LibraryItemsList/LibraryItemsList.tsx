// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useQuery, useMutation} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {SelectionModeContext} from 'context';
import {SearchContext} from 'hooks/useSearchReducer/searchContext';
import searchReducer, {initialSearchState, SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '_gqlTypes/SAVE_USER_DATA';
import {ISearchRecord} from 'hooks/useSearchReducer/_types';
import React, {useEffect, useReducer} from 'react';
import {useAppSelector} from 'redux/store';
import {useUser} from '../../hooks/UserHook/UserHook';
import styled, {CSSObject} from 'styled-components';
import {checkTypeIsLink, getAttributeFromKey, localizedTranslation} from 'utils';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import _ from 'lodash';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {defaultSort, defaultView, panelSize, viewSettingsField} from '../../constants/constants';
import {getRecordsFromLibraryQuery} from '../../graphQL/queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '../../graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import {useLang} from '../../hooks/LangHook/LangHook';

import {IAttribute, IField, IParentAttributeData, IView, SharedStateSelectionType} from '../../_types/types';
import DisplayTypeSelector from './DisplayTypeSelector';
import {getFiltersFromRequest} from './FiltersPanel/getFiltersFromRequest';
import {getRequestFromFilters} from './FiltersPanel/getRequestFromFilter';
import {manageItems} from './manageItems';
import MenuItemList from './MenuItemList';
import MenuItemListSelected from './MenuItemListSelected';
import SideItems from './SideItems';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {GET_VIEW_view_sort, GET_VIEWVariables, GET_VIEW, GET_VIEW_view} from '_gqlTypes/GET_VIEW';
import {getViewByIdQuery} from '../../graphQL/queries/views/getViewById';

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

const MenuWrapper = styled.div`
    border-bottom: 1px solid rgb(235, 237, 240);
    padding: 0 1rem;
    height: 4rem;

    display: flex;
    align-content: center;
    justify-content: space-around;
`;

interface ILibraryItemsListProps {
    selectionMode?: boolean;
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list;
}

function LibraryItemsList({selectionMode, library}: ILibraryItemsListProps): JSX.Element {
    const [{lang}] = useLang();
    const [user] = useUser();

    const {display, selection: selectionState} = useAppSelector(state => state); // keep selection
    const [searchState, searchDispatch] = useReducer(searchReducer, {...initialSearchState, library});
    const [updateSelectedViewMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);
    const SELECTED_VIEW_KEY = 'selected_view_' + library.id;

    useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        fetchPolicy: 'no-cache',
        variables: {keys: [SELECTED_VIEW_KEY]},
        onCompleted: d => {
            const viewId = d.userData?.data[SELECTED_VIEW_KEY] || defaultView.id;

            const attributesFromQuery: IAttribute[] = library.attributes.reduce((acc: IAttribute[], attribute) => {
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
                            linkedLibrary: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                                .linked_library,
                            linkedTree: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute)
                                .linked_tree,
                            library: library.id
                        }
                    ];

                    // case attribute is a linked attribute
                    if (
                        (attribute.type === AttributeType.simple_link ||
                            attribute.type === AttributeType.advanced_link) &&
                        (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                            .linked_library
                    ) {
                        const linkedLibraryId = (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                            .linked_library.id;
                        const newLinkedAttributes: IAttribute[] = (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute).linked_library.attributes.map(
                            linkedAttribute => ({
                                id: linkedAttribute.id,
                                type: linkedAttribute.type,
                                format: linkedAttribute.format,
                                label: linkedAttribute.label,
                                isLink: checkTypeIsLink(linkedAttribute.type),
                                isMultiple: linkedAttribute.multiple_values,
                                linkedLibrary: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                                    .linked_library,
                                linkedTree: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute)
                                    .linked_tree,
                                library: linkedLibraryId
                            })
                        );

                        newAttributes.push(...newLinkedAttributes);
                    }

                    if (
                        attribute.type === AttributeType.tree &&
                        (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute).linked_tree
                    ) {
                        const newLinkedAttributes: IAttribute[] = (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute).linked_tree.libraries
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
            }, []);

            searchDispatch({type: SearchActionTypes.SET_ATTRIBUTES, attributes: attributesFromQuery});

            if (viewId === defaultView.id) {
                const newView: IView = library.defaultView
                    ? {
                          id: library.defaultView.id,
                          owner: true,
                          library: library.id,
                          label: library.defaultView.label,
                          description: library.defaultView.description,
                          type: library.defaultView.type,
                          color: library.defaultView.color,
                          shared: library.defaultView.shared,
                          filters: getFiltersFromRequest(
                              library.defaultView.filters ?? [],
                              library.id,
                              attributesFromQuery
                          ),
                          sort: library.defaultView.sort,
                          settings: library.defaultView.settings
                      }
                    : {...defaultView, label: defaultView.label};

                searchDispatch({type: SearchActionTypes.SET_VIEW, view: {current: newView, reload: true, sync: false}});
            } else {
                getSelectedView({
                    variables: {
                        viewId
                    }
                });
            }
        }
    });

    const [getSelectedView, {error: getSelectedViewError}] = useLazyQuery<GET_VIEW, GET_VIEWVariables>(
        getViewByIdQuery,
        {
            onCompleted: data => {
                const v: IView = {
                    ...(_.omit(data.view, ['created_by', '__typename']) as GET_VIEW_view),
                    owner: data.view.created_by.id === user?.userId,
                    filters: Array.isArray(data.view.filters)
                        ? getFiltersFromRequest(data.view.filters, searchState.library.id, searchState.attributes)
                        : [],
                    sort: _.omit(data.view.sort, ['__typename']) as GET_VIEW_view_sort,
                    settings: data.view.settings?.map(s => _.omit(s, '__typename'))
                };

                searchDispatch({type: SearchActionTypes.SET_VIEW, view: {current: v, reload: true, sync: false}});
            }
        }
    );

    // Get data
    const [getRecords, {error: getRecordsError, refetch}] = useLazyQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery(library.gqlNames.query, searchState.fields), {
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            const itemsFromQuery = data ? data[library.gqlNames.query || ''].list : [];

            const newRecords: ISearchRecord[] = manageItems({
                items: itemsFromQuery,
                fields: searchState.fields
            });

            searchDispatch({
                type: SearchActionTypes.SET_TOTAL_COUNT,
                totalCount: data[library.gqlNames.query]?.totalCount
            });

            searchDispatch({type: SearchActionTypes.SET_RECORDS, records: newRecords});
            searchDispatch({type: SearchActionTypes.SET_LOADING, loading: false});
        }
    });

    useEffect(() => {
        if (!searchState.view.reload) {
            return;
        }

        const getFieldFromKey = (fieldKey: string): IField => {
            let parentAttributeData: IParentAttributeData | undefined;
            const splitKey = fieldKey.split('.');
            const attribute = getAttributeFromKey(fieldKey, library.id, searchState.attributes);
            let recordLibrary = null;

            // For attributes through tree attribute, key is [parent attribute].[record library].[attribute]
            if (splitKey.length === 3) {
                const parentAttributeId = splitKey[0];
                const parentAttribute = searchState.attributes.find(
                    att => parentAttributeId === att.id && library.id === att.library
                );

                if (parentAttribute) {
                    parentAttributeData = {
                        id: parentAttribute.id,
                        type: parentAttribute.type
                    };

                    recordLibrary = splitKey[1];
                }
            }

            if (!attribute) {
                return null;
            }

            const label =
                typeof attribute.label === 'string' ? attribute.label : localizedTranslation(attribute.label, lang);

            const field: IField = {
                key: fieldKey,
                id: attribute.id,
                library: attribute.library,
                label,
                format: attribute.format,
                type: attribute.type,
                parentAttributeData,
                recordLibrary
            };

            return field;
        };

        // Load initials fields from view fields
        const newFields: IField[] = !!searchState.view.current.settings?.find(s => s.name === viewSettingsField)
            ? searchState.view.current?.settings
                  .find(s => s.name === viewSettingsField)
                  .value.reduce((acc, fieldKey) => {
                      const field = getFieldFromKey(fieldKey);
                      return field ? [...acc, field] : acc;
                  }, [])
            : [];

        searchDispatch({type: SearchActionTypes.SET_FIELDS, fields: newFields});

        const queryFilters = getRequestFromFilters(searchState.view.current.filters);

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: searchState.view.current.filters
        });

        searchDispatch({
            type: SearchActionTypes.SET_QUERY_FILTERS,
            queryFilters
        });

        // update sort
        const field = searchState.view.current.sort?.field || defaultSort.field;
        const order = searchState.view.current.sort?.order || defaultSort.order;

        getRecords({
            variables: {
                limit: searchState.pagination,
                offset: searchState.offset,
                filters: queryFilters,
                sortField: field,
                sortOrder: order,
                fullText: searchState.fullText
            }
        });

        updateSelectedViewMutation({
            variables: {
                key: SELECTED_VIEW_KEY,
                value: searchState.view.current.id,
                global: false
            }
        });

        searchDispatch({type: SearchActionTypes.SET_SORT, sort: {field, order, active: true}});
        searchDispatch({type: SearchActionTypes.SET_DISPLAY_TYPE, displayType: searchState.view.current.type});
        searchDispatch({
            type: SearchActionTypes.SET_VIEW,
            view: {current: searchState.view.current, reload: false, sync: true}
        });
    }, [
        SELECTED_VIEW_KEY,
        updateSelectedViewMutation,
        getRecords,
        searchState.view,
        searchState.attributes,
        searchState.library.id,
        searchState.fullText,
        searchState.offset,
        searchState.pagination,
        searchState.queryFilters,
        searchState.sort,
        lang,
        searchDispatch,
        library
    ]);

    useEffect(() => {
        if (searchState.loading) {
            getRecords({
                variables: {
                    limit: searchState.pagination,
                    offset: searchState.offset,
                    filters: searchState.queryFilters,
                    sortField: searchState.sort?.field ?? defaultSort.field,
                    sortOrder: searchState.sort?.order ?? defaultSort.order,
                    fullText: searchState.fullText
                }
            });
        }
    }, [
        searchState.fullText,
        searchState.offset,
        searchState.pagination,
        searchState.queryFilters,
        searchState.sort,
        searchState.loading,
        library.gqlNames.query,
        getRecords
    ]);

    if (getRecordsError || getSelectedViewError) {
        return <ErrorDisplay message={(getRecordsError || getSelectedViewError).message} />;
    }

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
            </SelectionModeContext.Provider>
        </SearchContext.Provider>
    );
}

export default LibraryItemsList;
