// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {SelectionModeContext} from 'context';
import {SearchContext} from 'hooks/useSearchReducer/searchContext';
import searchReducer, {initialSearchState, SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {ISearchRecord} from 'hooks/useSearchReducer/_types';
import React, {useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {checkTypeIsLink, getAttributeFromKey, localizedLabel} from 'utils';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeFormat, AttributeType, ViewTypes} from '_gqlTypes/globalTypes';
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
    const {t} = useTranslation();
    const [{lang}] = useLang();

    const {display, selection: selectionState} = useAppSelector(state => state); // keep selection
    const [searchState, searchDispatch] = useReducer(searchReducer, {...initialSearchState, library});

    const currentLibId = library.id;

    // Current View
    useEffect(() => {
        let newView: IView | undefined;

        if (library.defaultView) {
            newView = {
                id: library.defaultView.id,
                label: localizedLabel(library.defaultView.label, lang),
                description: library.defaultView.description,
                type: library.defaultView.type,
                color: library.defaultView.color,
                shared: library.defaultView.shared,
                fields: library.defaultView.settings?.find(setting => setting.name === viewSettingsField)?.value ?? [],
                filters: library.defaultView.filters,
                sort: library.defaultView.sort
            };
        } else {
            // use defaultView and translate label
            newView = {...defaultView, label: t(defaultView.label)};
        }

        searchDispatch({type: SearchActionTypes.SET_VIEW, view: {current: newView, reload: true}});

        // Attributes
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
                        library: currentLibId
                    }
                ];

                // case attribute is a linked attribute
                if (
                    (attribute.type === AttributeType.simple_link || attribute.type === AttributeType.advanced_link) &&
                    (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute).linked_library
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
    }, [currentLibId, lang, library.attributes, library.defaultView, t, searchDispatch]);

    useEffect(() => {
        if (!searchState.view.current || !searchState.view.reload) {
            return;
        }

        if (searchState.view.current.type === ViewTypes.list) {
            // Load initials fields from view fields
            const newFields = searchState.view.current.fields?.reduce((acc, fieldKey) => {
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
                    return acc;
                }

                const label =
                    typeof attribute.label === 'string' ? attribute.label : localizedLabel(attribute.label, lang);

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

                return [...acc, field];
            }, []);

            searchDispatch({type: SearchActionTypes.SET_FIELDS, fields: newFields ?? []});
        }

        // update Filters
        if (searchState.view.current.filters) {
            searchDispatch({
                type: SearchActionTypes.SET_FILTERS,
                filters: getFiltersFromRequest(
                    searchState.view.current.filters,
                    searchState.library.id,
                    searchState.attributes
                )
            });

            searchDispatch({
                type: SearchActionTypes.SET_QUERY_FILTERS,
                queryFilters: searchState.view.current.filters
            });
        } else {
            // reset filters
            searchDispatch({
                type: SearchActionTypes.SET_QUERY_FILTERS,
                queryFilters: []
            });
        }

        // update sort
        const field = searchState.view.current.sort?.field ?? defaultSort.field;
        const order = searchState.view.current.sort?.order ?? defaultSort.order;

        searchDispatch({type: SearchActionTypes.SET_VIEW, view: {current: searchState.view.current, reload: false}});
        searchDispatch({type: SearchActionTypes.SET_SORT, sort: {field, order, active: true}});
    }, [searchState.view, searchState.attributes, searchState.library.id, lang, searchDispatch, library]);

    // Get data
    const [getRecords, {error, refetch}] = useLazyQuery<
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
        if (searchState.loading || searchState.view.reload) {
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
    }, [searchState, library.gqlNames.query, getRecords]);

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    // if some elements are selected and the selection type is search, show the selection Menu
    const menuSelectedActive = selectionMode
        ? !!selectionState.searchSelection.selected.length ||
          (selectionState.searchSelection.type === SharedStateSelectionType.search &&
              selectionState.searchSelection.allSelected)
        : !!selectionState.selection.selected.length ||
          (selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected);

    return (
        // <FilterStateContext.Provider value={{stateFilters, dispatchFilters}}>
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
        // </FilterStateContext.Provider>
    );
}

export default LibraryItemsList;
