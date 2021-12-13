// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Menu, Dropdown, Button, Badge} from 'antd';
import React, {useState} from 'react';
import {BranchesOutlined, NumberOutlined, DatabaseOutlined} from '@ant-design/icons';
import {useLang} from '../../../hooks/LangHook/LangHook';
import useSearchReducer from 'hooks/useSearchReducer';
import {useTranslation} from 'react-i18next';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {defaultFilterConditionByAttributeFormat, checkTypeIsLink, localizedTranslation, limitTextSize} from 'utils';
import {getDefaultFilterValueByFormat} from '../FiltersPanel/Filter/Filter';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {
    IFilter,
    TypeSideItem,
    TreeConditionFilter,
    ThroughConditionFilter,
    AttributeConditionFilter,
    IFilterTree,
    FilterType,
    IFilterAttribute,
    IFilterLibrary,
    ISystemTranslation
} from '_types/types';
import {useAppDispatch} from 'redux/store';
import {setDisplaySide} from 'redux/display';
import {
    ILibraryDetailExtendedAttributeChild,
    ILibraryDetailExtendedAttributeParentLinkedTree
} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';

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

    const dispatch = useAppDispatch();

    const getAttributeFilter = (attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes): IFilterAttribute => {
        let key = attribute.id;

        if (typeof (filter as IFilterAttribute)?.parentTreeLibrary !== 'undefined') {
            key = `${(filter as IFilterAttribute)?.parentTreeLibrary.key}.${attribute.id}`;
        } else if (filter?.condition === ThroughConditionFilter.THROUGH && filter.type === FilterType.LIBRARY) {
            key = `${(filter as IFilterLibrary).key}.${attribute.id}`;
        } else if (filter?.condition === ThroughConditionFilter.THROUGH) {
            key = `${(filter as IFilterAttribute)?.attribute?.id}.${attribute.id}`;
        } else if ((filter as IFilterAttribute)?.attribute?.parentAttribute) {
            key = `${(filter as IFilterAttribute)?.attribute?.parentAttribute.id}.${attribute.id}`;
        }

        return {
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
                        ? AttributeFormat.text
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
                embedded_fields: (attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute).embedded_fields,
                ...(filter?.condition === ThroughConditionFilter.THROUGH
                    ? {parentAttribute: (filter as IFilterAttribute)?.attribute}
                    : (filter as IFilterAttribute)?.attribute?.parentAttribute
                    ? {parentAttribute: (filter as IFilterAttribute)?.attribute?.parentAttribute}
                    : {})
            },
            ...(filter?.type === FilterType.LIBRARY
                ? {parentTreeLibrary: filter as IFilterLibrary}
                : typeof (filter as IFilterAttribute)?.parentTreeLibrary !== 'undefined'
                ? {parentTreeLibrary: (filter as IFilterAttribute)?.parentTreeLibrary}
                : {}),
            value: {value: getDefaultFilterValueByFormat(attribute.format)}
        };
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
    }): IFilterLibrary => ({
        type: FilterType.LIBRARY,
        index: Date.now(),
        active: true,
        key:
            filter?.condition === ThroughConditionFilter.THROUGH
                ? `${(filter as IFilterAttribute).attribute?.id}.${library.id}`
                : `${filter?.key.split('.').slice(0, -1).join('.')}.${library.id}`,
        condition: AttributeConditionFilter[defaultFilterConditionByAttributeFormat(AttributeFormat.text)],
        library: {id: library.id, label: library.label},
        value: {value: getDefaultFilterValueByFormat(AttributeFormat.text)},
        ...(filter?.condition === ThroughConditionFilter.THROUGH
            ? {parentAttribute: (filter as IFilterAttribute).attribute}
            : {parentAttribute: (filter as IFilterLibrary).parentAttribute})
    });

    const addFilter = (newFilter: IFilter) => {
        const filters = [...searchState.filters];

        if (typeof filter !== 'undefined') {
            // replace current filter
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

    const menu = (
        <Menu>
            {trees.length && (
                <Menu.ItemGroup title={t('filters.trees-group')}>
                    {trees.map(tree => (
                        <Menu.Item
                            icon={<BranchesOutlined />}
                            key={tree.id}
                            onClick={() => addFilter(getTreeFilter(tree))}
                        >
                            {isFilterUsed(tree.id) ? (
                                <Badge color={'blue'} text={localizedTranslation(tree.label, lang) || tree.id} />
                            ) : (
                                localizedTranslation(tree.label, lang) || tree.id
                            )}
                        </Menu.Item>
                    ))}
                </Menu.ItemGroup>
            )}
            {attributes.length && (
                <Menu.ItemGroup title={t('filters.attributes-group')}>
                    {attributes.map(attribute => (
                        <Menu.Item
                            icon={<NumberOutlined />}
                            key={attribute.id}
                            onClick={() => addFilter(getAttributeFilter(attribute))}
                        >
                            {isFilterUsed(attribute.id) ? (
                                <Badge
                                    color={'blue'}
                                    text={localizedTranslation(attribute.label, lang) || attribute.id}
                                />
                            ) : (
                                localizedTranslation(attribute.label, lang) || attribute.id
                            )}
                        </Menu.Item>
                    ))}
                </Menu.ItemGroup>
            )}
            {libraries.length && (
                <Menu.ItemGroup title={t('filters.libraries-group')}>
                    {libraries.map(l => (
                        <Menu.Item
                            icon={<DatabaseOutlined />}
                            key={l.library.id}
                            onClick={() => addFilter(getLibraryFilter(l.library))}
                        >
                            {localizedTranslation(l.library.label, lang) || l.library.id}
                        </Menu.Item>
                    ))}
                </Menu.ItemGroup>
            )}
        </Menu>
    );

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
