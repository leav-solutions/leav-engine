// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Menu, Dropdown, Badge, Typography} from 'antd';
import {FilterOutlined, PlusOutlined} from '@ant-design/icons';
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
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {defaultFilterConditionByAttributeFormat, checkTypeIsLink, localizedTranslation} from 'utils';
import {getDefaultFilterValueByFormat} from '../../FiltersPanel/AddFilter/AddFilter';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {IFilter, TypeSideItem, IEmbeddedFields} from '_types/types';
import themingVar from '../../../../themingVar';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {setDisplaySide} from 'redux/display';

const CustomBadge = styled(Badge)`
    float: right;

    .ant-badge-count {
        background: ${themingVar['@leav-primary-btn-bg-hover']};
    }
`;

interface IFiltersDropdownProps {
    activeLibrary: IActiveLibrary;
}

function FiltersDropdown({activeLibrary}: IFiltersDropdownProps): JSX.Element {
    const {t} = useTranslation();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [{lang}] = useLang();

    const {display} = useAppSelector(state => state);
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

    const addFilter = (fieldsKey: string, attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes) => {
        const filterIndex = searchState.filters.length;

        const newFilter: IFilter = {
            index: filterIndex + 1,
            key: fieldsKey,
            active: true,
            condition: RecordFilterCondition[defaultFilterConditionByAttributeFormat(attribute.format)],
            attribute: {
                ...attribute,
                library: activeLibrary.id,
                isLink: checkTypeIsLink(attribute.type),
                isMultiple: attribute.multiple_values
            },
            value: {value: getDefaultFilterValueByFormat(attribute.format)}
        };

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: [...searchState.filters, newFilter]
        });

        dispatch(
            setDisplaySide({
                visible: true,
                type: TypeSideItem.filters
            })
        );
    };

    const _toggleShowFilters = () => {
        dispatch(
            setDisplaySide({
                visible: !display.side.visible || display.side.type !== TypeSideItem.filters,
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
            <Menu.Item onClick={() => addFilter(fieldsKey, attribute)}>
                {localizedTranslation(attribute.label, lang) || attribute.id} <FilterBadge filterKey={fieldsKey} />
            </Menu.Item>
        );
    };

    const FilterBadge = ({filterKey}): JSX.Element => {
        return <CustomBadge count={searchState.filters.filter(filter => filter.key === filterKey).length} />;
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
                    <Menu.SubMenu title={localizedTranslation(field.label, lang) || field.id}>
                        {AddItem(newPath, attribute)}
                        <Menu.ItemGroup title={t('filters.search-in')}>
                            {extendedItem(field.embedded_fields, attribute, newPath)}
                        </Menu.ItemGroup>
                    </Menu.SubMenu>
                );
            }

            return (
                <Menu.Item onClick={() => addFilter(_getFieldsKeyFromAttribute(attribute, newPath), attribute)}>
                    {localizedTranslation(field.label, lang) || field.id} <FilterBadge filterKey={fieldsKey} />
                </Menu.Item>
            );
        });
    };

    const AddItem = (
        fieldsKey: string,
        attribute: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes
    ): JSX.Element => {
        return (
            <Menu.Item onClick={() => addFilter(fieldsKey, attribute)}>
                <Typography.Text
                    style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                    strong
                >
                    {t('filters.add')}
                    {FilterBadge({filterKey: fieldsKey})}
                </Typography.Text>
            </Menu.Item>
        );
    };

    const menu = (
        <Menu>
            {activeLibrary.attributes.map(a => {
                if (checkTypeIsLink(a.type)) {
                    return (
                        <Menu.SubMenu title={localizedTranslation(a.label, lang) || a.id}>
                            {AddItem(a.id, a)}
                            <Menu.ItemGroup title={t('filters.search-in')}>
                                {(a as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute).linked_library.attributes.map(
                                    linkedAttr =>
                                        menuItem(linkedAttr, `${a.id}.${linkedAttr.id}`, {type: a.type, id: a.id})
                                )}
                            </Menu.ItemGroup>
                        </Menu.SubMenu>
                    );
                } else if (a.type === AttributeType.tree) {
                    return (
                        <Menu.SubMenu title={localizedTranslation(a.label, lang) || a.id}>
                            {AddItem(a.id, a)}
                            {(a as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute).linked_tree.libraries.map(
                                library => (
                                    <Menu.ItemGroup title={library.library.id}>
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
                                    </Menu.ItemGroup>
                                )
                            )}
                        </Menu.SubMenu>
                    );
                } else if (a?.format === AttributeFormat.extended) {
                    return (
                        <Menu.SubMenu title={localizedTranslation(a.label, lang) || a.id}>
                            {AddItem(a.id, a)}
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
        </Menu>
    );

    return (
        <Dropdown.Button onClick={_toggleShowFilters} overlay={menu} icon={<PlusOutlined />}>
            <FilterOutlined /> {t('filters.filters')}
        </Dropdown.Button>
    );
}

export default FiltersDropdown;
