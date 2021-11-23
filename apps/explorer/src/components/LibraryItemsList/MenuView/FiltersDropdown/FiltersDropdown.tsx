// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Menu, Dropdown, Badge, Typography, Button} from 'antd';
import React from 'react';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {IActiveLibrary} from 'graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import useSearchReducer from 'hooks/useSearchReducer';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_gqlTypes/globalTypes';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {defaultFilterConditionByAttributeFormat, checkTypeIsLink, localizedTranslation} from 'utils';
import {getDefaultFilterValueByFormat} from '../../FiltersPanel/AddFilter/AddFilter';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {IFilter, TypeSideItem, IEmbeddedFields, TreeConditionFilter} from '_types/types';
import themingVar from '../../../../themingVar';
import {useAppDispatch} from 'redux/store';
import {setDisplaySide} from 'redux/display';
import {ButtonType} from 'antd/lib/button';

const CustomBadge = styled(Badge)`
    float: right;

    .ant-badge-count {
        background: ${themingVar['@leav-primary-btn-bg-hover']};
    }
`;

interface IFiltersDropdownProps {
    type: ButtonType;
    activeLibrary: IActiveLibrary;
    label?: string;
    icon?: JSX.Element;
    filterIndex?: number;
}

function FiltersDropdown({label, type, icon, filterIndex, activeLibrary}: IFiltersDropdownProps): JSX.Element {
    const {t} = useTranslation();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [{lang}] = useLang();

    const dispatch = useAppDispatch();

    const _getFieldsKeyFromAttribute = (
        attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
        path: string,
        parent?: {type: string; id: string},
        libraryAttribute?: string
    ): string => {
        if (attribute?.format === AttributeFormat.extended && path) {
            return `${path}`;
        } else if (typeof parent !== 'undefined') {
            return parent.type === AttributeType.tree && typeof libraryAttribute !== 'undefined'
                ? `${parent.id}.${libraryAttribute}.${attribute.id}`
                : `${parent.id}.${attribute.id}`;
        }

        return `${attribute.id}`;
    };

    const getAttributeFilter = (
        fieldsKey: string,
        attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes
    ): IFilter => ({
        index: searchState.filters.length,
        active: true,
        key: fieldsKey,
        condition: RecordFilterCondition[defaultFilterConditionByAttributeFormat(attribute.format)],
        attribute: {
            ...attribute,
            library: activeLibrary.id,
            isLink: checkTypeIsLink(attribute.type),
            isMultiple: attribute.multiple_values
        },
        value: {value: getDefaultFilterValueByFormat(attribute.format)}
    });

    const getTreeFilter = (tree: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees): IFilter => ({
        index: searchState.filters.length,
        active: true,
        key: tree.id,
        condition: RecordFilterCondition[TreeConditionFilter.CLASSIFIED_IN],
        tree: {...tree, libraries: []},
        value: {value: null}
    });

    const addFilter = (newFilter: IFilter) => {
        const filters = [...searchState.filters];

        if (typeof filterIndex !== 'undefined') {
            // replace current filter
            filters.splice(filterIndex, 1, {...newFilter, index: filterIndex});
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

    const menuItem = (
        attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
        path: string,
        parent?: {type: string; id: string},
        libraryAttribute?: string
    ): JSX.Element => {
        const fieldsKey = _getFieldsKeyFromAttribute(attribute, path, parent, libraryAttribute);

        return (
            <Menu.Item key={attribute.id} onClick={() => addFilter(getAttributeFilter(fieldsKey, attribute))}>
                {localizedTranslation(attribute.label, lang) || attribute.id} <FilterBadge filterKey={fieldsKey} />
            </Menu.Item>
        );
    };

    const FilterBadge = ({filterKey}): JSX.Element => {
        return <CustomBadge count={searchState.filters.filter(f => f.key === filterKey).length} />;
    };

    const extendedItem = (
        fields: IEmbeddedFields[],
        attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
        path: string
    ): JSX.Element[] => {
        return fields.map(field => {
            const newPath = `${path}.${field.id}`;
            const fieldsKey = _getFieldsKeyFromAttribute(attribute, newPath);

            if (field?.format === AttributeFormat.extended) {
                return (
                    <Menu.SubMenu key={field.id} title={localizedTranslation(field.label, lang) || field.id}>
                        {AddItem(getAttributeFilter(newPath, attribute))}
                        <Menu.ItemGroup title={t('filters.search-in')}>
                            {extendedItem(field.embedded_fields, attribute, newPath)}
                        </Menu.ItemGroup>
                    </Menu.SubMenu>
                );
            }

            return (
                <Menu.Item
                    key={field.id}
                    onClick={() =>
                        addFilter(getAttributeFilter(_getFieldsKeyFromAttribute(attribute, newPath), attribute))
                    }
                >
                    {localizedTranslation(field.label, lang) || field.id} <FilterBadge filterKey={fieldsKey} />
                </Menu.Item>
            );
        });
    };

    const AddItem = (filter: IFilter): JSX.Element => {
        return (
            <Menu.Item onClick={() => addFilter(filter)}>
                <Typography.Text
                    style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                    strong
                >
                    {t('filters.add')}
                    {FilterBadge({filterKey: filter.key})}
                </Typography.Text>
            </Menu.Item>
        );
    };

    const menu = (
        <Menu>
            <Menu.ItemGroup title={t('filters.trees-group')}>
                {activeLibrary.trees.map(tree => (
                    <Menu.Item key={tree.id} onClick={() => addFilter(getTreeFilter(tree))}>
                        {localizedTranslation(tree.label, lang) || tree.id} <FilterBadge filterKey={tree.id} />
                    </Menu.Item>
                ))}
            </Menu.ItemGroup>
            <Menu.Divider />
            <Menu.ItemGroup title={t('filters.attributes-group')}>
                {activeLibrary.attributes.map(a => {
                    if (checkTypeIsLink(a.type)) {
                        return (
                            <Menu.SubMenu key={a.id} title={localizedTranslation(a.label, lang) || a.id}>
                                {AddItem(getAttributeFilter(a.id, a))}
                                <Menu.ItemGroup title={t('filters.search-in')}>
                                    {(a as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute).linked_library.attributes.map(
                                        linkedAttr =>
                                            menuItem(linkedAttr, `${a.id}.${linkedAttr.id}`, {type: a.type, id: a.id})
                                    )}
                                </Menu.ItemGroup>
                            </Menu.SubMenu>
                        );
                    } else if (a.type === AttributeType.tree) {
                        const tree = (a as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute)
                            .linked_tree;

                        return (
                            <Menu.SubMenu key={a.id} title={localizedTranslation(a.label, lang) || a.id}>
                                {AddItem(getTreeFilter(tree))}
                                {(a as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute).linked_tree.libraries.map(
                                    library => (
                                        <Menu.SubMenu
                                            key={library.library.id}
                                            title={
                                                localizedTranslation(library.library.label, lang) || library.library.id
                                            }
                                        >
                                            {library.library.attributes.map(lta => {
                                                return menuItem(
                                                    lta,
                                                    `${a.id}.${library.library.id}.${lta.id}`,
                                                    {
                                                        type: a.type,
                                                        id: a.id
                                                    },
                                                    library.library.id
                                                );
                                            })}
                                        </Menu.SubMenu>
                                    )
                                )}
                            </Menu.SubMenu>
                        );
                    } else if (a?.format === AttributeFormat.extended) {
                        return (
                            <Menu.SubMenu key={a.id} title={localizedTranslation(a.label, lang) || a.id}>
                                {AddItem(getAttributeFilter(a.id, a))}
                                {extendedItem(
                                    (a as GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute)
                                        .embedded_fields as IEmbeddedFields[],
                                    a,
                                    a.id
                                )}
                            </Menu.SubMenu>
                        );
                    }

                    return menuItem(a, a.id);
                })}
            </Menu.ItemGroup>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']}>
            <Button type={type} icon={icon}>
                {label}
            </Button>
        </Dropdown>
    );
}

export default FiltersDropdown;
