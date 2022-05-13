// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {BranchesOutlined, NumberOutlined} from '@ant-design/icons';
import {Badge, Dropdown, Input, Menu} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {defaultLinkAttributeFilterFormat} from 'constants/constants';
import {
    ILibraryDetailExtendedAttributeChild,
    ILibraryDetailExtendedAttributeParentLinkedTree,
    ILibraryDetailExtendedAttributeParentLinkedTreeLibrary
} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setDisplaySide} from 'redux/display';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import {checkTypeIsLink, defaultFilterConditionByAttributeFormat, localizedTranslation} from 'utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeType} from '_gqlTypes/globalTypes';
import {
    AttributeConditionFilter,
    FilterType,
    IFilter,
    IFilterAttribute,
    IFilterLibrary,
    IFilterTree,
    ISystemTranslation,
    ThroughConditionFilter,
    TreeConditionFilter,
    TypeSideItem
} from '_types/types';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {getDefaultFilterValueByFormat} from '../FiltersPanel/Filter/Filter';

const CustomMenu = styled(Menu)`
    & .elements-wrapper {
        max-height: 75vh;
        overflow-y: auto;

        > .ant-dropdown-menu-item-group-title {
            display: none;
        }
    }
`;

interface IFiltersDropdownProps {
    libraryId: string;
    button: JSX.Element;
    attributes: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[];
    libraries: ILibraryDetailExtendedAttributeParentLinkedTree['libraries'];
    trees: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees[];
    disabled?: boolean;
    filter?: IFilter; // if replace filter
}

function FiltersDropdown({
    libraryId,
    button,
    attributes,
    libraries,
    trees,
    filter
}: IFiltersDropdownProps): JSX.Element {
    const {t} = useTranslation();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [{lang}] = useLang();
    const [visible, setVisible] = useState<boolean>(false);
    const [search, setSearch] = useState<string>();

    const dispatch = useAppDispatch();

    const getAttributeFilter = (attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes): IFilterAttribute => {
        // we set the new filter key with the attribute id by default
        let key = attribute.id;

        // If we replace a current filter, the filter key depends on filter type and whether it goes through parent attributes or not
        // The key is a concatenation of parents attribute's id
        if (typeof (filter as IFilterAttribute)?.parentTreeLibrary !== 'undefined') {
            key = `${(filter as IFilterAttribute)?.parentTreeLibrary.key}.${attribute.id}`;
        } else if (filter?.condition === ThroughConditionFilter.THROUGH && filter.type === FilterType.LIBRARY) {
            key = `${(filter as IFilterLibrary).key}.${attribute.id}`;
        } else if (filter?.condition === ThroughConditionFilter.THROUGH) {
            key = `${(filter as IFilterAttribute)?.attribute?.id}.${attribute.id}`;
        } else if ((filter as IFilterAttribute)?.attribute?.parentAttribute) {
            key = `${(filter as IFilterAttribute)?.attribute?.parentAttribute.id}.${attribute.id}`;
        }

        const filterAttribute: IFilterAttribute = {
            type: FilterType.ATTRIBUTE,
            index: Date.now(),
            active: true,
            key,
            condition: AttributeConditionFilter[defaultFilterConditionByAttributeFormat(attribute.format)],
            attribute: {
                id: attribute.id,
                type: attribute.type,
                format:
                    checkTypeIsLink(attribute.type) || attribute.type === AttributeType.tree
                        ? defaultLinkAttributeFilterFormat
                        : attribute.format,
                label: attribute.label,
                isLink: checkTypeIsLink(attribute.type),
                isMultiple: attribute.multiple_values,
                linkedLibrary: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                    .linked_library,
                linkedTree: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute)
                    .linked_tree,
                library:
                    (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute).linked_library
                        ?.id || libraryId,
                embedded_fields: (attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute).embedded_fields
            },
            value: {value: getDefaultFilterValueByFormat(attribute.format)}
        };

        // If filter's condition is a through condition it means current filter is a parent
        // so we set the parentAttribute field to current filter's attribute, otherwise it means
        // that the current filter is just a "brother" so we get the parent attribute of the current filter instead
        if (filter?.condition === ThroughConditionFilter.THROUGH) {
            filterAttribute.attribute.parentAttribute = (filter as IFilterAttribute)?.attribute;
        } else if ((filter as IFilterAttribute)?.attribute?.parentAttribute) {
            filterAttribute.attribute.parentAttribute = (filter as IFilterAttribute)?.attribute?.parentAttribute;
        }

        // When we chose an attribute through a tree attribute and a child library we have to set the parent tree library of the new filter
        // If current filter type is not library it means we just change the current filter attribute by another at the same level,
        // so the parent tree library is not as the first time, the filter itself, but the parentTreeLibrary of this one
        if (filter?.type === FilterType.LIBRARY) {
            filterAttribute.parentTreeLibrary = filter as IFilterLibrary;
        } else if (typeof (filter as IFilterAttribute)?.parentTreeLibrary !== 'undefined') {
            filterAttribute.parentTreeLibrary = (filter as IFilterAttribute)?.parentTreeLibrary;
        }

        return filterAttribute;
    };

    const getTreeFilter = (tree: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees): IFilterTree => ({
        type: FilterType.TREE,
        index: Date.now(),
        active: true,
        key: tree.id,
        condition: TreeConditionFilter[TreeConditionFilter.CLASSIFIED_IN],
        tree,
        value: {value: null}
    });

    const getLibraryFilter = (library: {
        id: string;
        label: ISystemTranslation;
        attributes: ILibraryDetailExtendedAttributeChild[];
    }): IFilterLibrary => {
        // If current filter's type is a LIBRARY type it means we just changed the child library
        // and not the parent attribute so we copy the current filter parent attribute
        // The key is a concatenation of parent attributes' and libraries' id
        const key =
            filter?.type !== FilterType.LIBRARY
                ? `${(filter as IFilterAttribute).attribute?.id}.${library.id}`
                : `${(filter as IFilterLibrary).parentAttribute?.id}.${library.id}`;

        return {
            type: FilterType.LIBRARY,
            index: Date.now(),
            active: true,
            key,
            condition:
                AttributeConditionFilter[defaultFilterConditionByAttributeFormat(defaultLinkAttributeFilterFormat)],
            library: {id: library.id, label: library.label},
            value: {value: getDefaultFilterValueByFormat(defaultLinkAttributeFilterFormat)},
            parentAttribute:
                filter?.condition === ThroughConditionFilter.THROUGH
                    ? (filter as IFilterAttribute).attribute ?? (filter as IFilterLibrary).parentAttribute
                    : (filter as IFilterLibrary).parentAttribute
        };
    };

    const addFilter = (newFilter: IFilter) => {
        const filters = [...searchState.filters];

        if (typeof filter !== 'undefined') {
            // we replace current filter
            const filterPos = searchState.filters.findIndex(f => f.index === filter.index);
            filters.splice(filterPos, 1, {...newFilter, index: filter.index});
        } else {
            filters.push(newFilter);
        }

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters
        });

        dispatch(
            setDisplaySide({
                visible: true,
                type: TypeSideItem.filters
            })
        );
    };

    const _handleVisibleChange = () => setVisible(!visible);

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const _translateLabel = function <
        T extends
            | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes
            | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees
            | ILibraryDetailExtendedAttributeParentLinkedTreeLibrary
    >(el: T) {
        return {
            ...el,
            localizedLabel: localizedTranslation(el.label, lang) || el.id
        };
    };

    const _filterBySearch = function (el: {id: string; localizedLabel: string}): boolean {
        const searchRegEx = new RegExp(`${search}`, 'i');
        return !search || !!el.id.match(searchRegEx) || !!el.localizedLabel.match(searchRegEx);
    };

    const filteredTrees = trees.map(_translateLabel).filter(_filterBySearch);
    const filteredAttributes = attributes.map(_translateLabel).filter(_filterBySearch);
    const filteredLibraries = libraries
        .map(lib => ({...lib, library: _translateLabel(lib.library)}))
        .filter(lib => _filterBySearch(lib.library));

    // to verify if a filter is used, we have to get the filter attribute/tree base id
    // and check if one of those is used in the list of filters depending on the filter type
    const isFilterUsed = (id: string) => {
        return searchState.filters.some(f => {
            return (
                (f as IFilterTree)?.key === id ||
                (f as IFilterAttribute).attribute?.parentAttribute?.id === id ||
                (f as IFilterLibrary).parentAttribute?.id === id ||
                (f as IFilterAttribute).parentTreeLibrary?.parentAttribute?.id === id
            );
        });
    };

    const menuItems: ItemType[] = [
        {
            key: 'search',
            label: <Input.Search placeholder={t('global.search')} onChange={_handleSearchChange} />
        },
        {
            key: 'divider',
            type: 'divider'
        }
    ];

    let menuElements = [];
    if (filteredTrees.length > 0) {
        menuElements = [
            ...menuElements,
            {
                key: 'trees-group',
                type: 'group',
                label: t('filters.trees-group'),
                children: filteredTrees.map(tree => ({
                    key: tree.id,
                    icon: <BranchesOutlined />,
                    onClick: () => addFilter(getTreeFilter(tree)),
                    label: isFilterUsed(tree.id) ? (
                        <Badge color={'blue'} text={tree.localizedLabel} />
                    ) : (
                        tree.localizedLabel
                    )
                }))
            }
        ];
    }

    if (filteredAttributes.length > 0) {
        menuElements = [
            ...menuElements,
            {
                key: 'attributes-group',
                type: 'group',
                label: t('filters.attributes-group'),
                children: filteredAttributes.map(attribute => ({
                    key: attribute.id,
                    icon: <NumberOutlined />,
                    onClick: () => addFilter(getAttributeFilter(attribute)),
                    label: isFilterUsed(attribute.id) ? (
                        <Badge color={'blue'} text={attribute.localizedLabel} />
                    ) : (
                        attribute.localizedLabel
                    )
                }))
            }
        ];
    }

    if (filteredLibraries.length > 0) {
        menuElements = [
            ...menuElements,
            {
                key: 'libraries-group',
                type: 'group',
                label: t('filters.libraries-group'),
                children: filteredLibraries.map(({library}) => ({
                    key: library.id,
                    icon: <NumberOutlined />,
                    onClick: () => addFilter(getLibraryFilter(library)),
                    label: isFilterUsed(library.id) ? (
                        <Badge color={'blue'} text={library.localizedLabel} />
                    ) : (
                        library.localizedLabel
                    )
                }))
            }
        ];
    }

    menuItems.push({
        key: 'elements-wrapper',
        type: 'group',
        children: menuElements,
        label: null,
        className: 'elements-wrapper',
        style: {maxHeight: '75vh', overflowY: 'auto'}
    });

    const menu = <CustomMenu items={menuItems} />;

    return (
        <Dropdown
            disabled={!!filter && !filter.active}
            visible={visible}
            onVisibleChange={_handleVisibleChange}
            overlay={menu}
            trigger={['click']}
        >
            {button}
        </Dropdown>
    );
}

export default FiltersDropdown;
