// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import moment from 'moment';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useActiveLibrary} from '../../../../hooks/ActiveLibHook/ActiveLibHook';
import {allowedTypeOperator, flatArray, getUniqueId} from '../../../../utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    AttributeFormat,
    ConditionFilter,
    FilterTypes,
    IFilter,
    IFilterSeparator,
    ISelectedAttribute
} from '../../../../_types/types';
import AttributesSelectionList from '../../../AttributesSelectionList';
import {
    ILibraryItemListState,
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes
} from '../../LibraryItemsListReducer';

interface IAttributeListProps {
    stateItems: ILibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    setFilters: React.Dispatch<React.SetStateAction<Array<Array<IFilter | IFilterSeparator>>>>;
    showAttr: boolean;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
    updateFilters: () => void;
}

const _getDefaultFilterValueByFormat = (format: AttributeFormat): boolean | string | number => {
    switch (format) {
        case AttributeFormat.boolean:
            return true;
        case AttributeFormat.date:
            return moment().utcOffset(0).startOf('day').unix();
        case AttributeFormat.numeric:
            return 0;
        default:
            return '';
    }
};

function AddFilter({
    stateItems,
    dispatchItems,
    setFilters,
    showAttr,
    setShowAttr,
    updateFilters
}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const [activeLibrary] = useActiveLibrary();

    const [attributesChecked, setAttributesChecked] = useState<ISelectedAttribute[]>([]);

    const addFilters = () => {
        const allAttributes = [...stateItems.attributes];

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ATTRIBUTES,
            attributes: allAttributes
        });

        setFilters(filters => {
            const separators = filters.map(filtersGroup =>
                filtersGroup.filter(filter => filter.type === FilterTypes.separator)
            );

            const newFilters: IFilter[] = attributesChecked.map((attributeChecked, index) => {
                const attribute: GET_ATTRIBUTES_BY_LIB_attributes_list = {
                    ...attributeChecked,
                    label: attributeChecked.label ?? null,
                    format: attributeChecked.format ?? null,
                    embedded_fields: attributeChecked.embeddedFieldData ? [attributeChecked.embeddedFieldData] : null,
                    linked_tree: null
                };
                if (attributeChecked.embeddedFieldData) {
                    const format = attributeChecked.embeddedFieldData.format;
                    const defaultConditionOptions =
                        (format && allowedTypeOperator[AttributeFormat[format]][0]) || ConditionFilter.equal;

                    const lastFilterIsSeparatorCondition = flatArray(separators).some(
                        separator => separator.key === filters.length + index - 1
                    );

                    const newFilter: IFilter = {
                        type: FilterTypes.filter,
                        key: filters.length + index,
                        id: getUniqueId(),
                        operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                        condition: defaultConditionOptions,
                        value: _getDefaultFilterValueByFormat(format),
                        attribute,
                        active: true,
                        format,
                        originAttributeData: attributeChecked.parentAttributeData,
                        treeData: attributeChecked.treeData,
                        extendedData: {...attributeChecked.embeddedFieldData, path: attributeChecked.path}
                    };
                    return newFilter;
                }

                // take the first operator for the format of the attribute
                const defaultConditionOptions =
                    (attributeChecked?.format && allowedTypeOperator[AttributeFormat[attributeChecked?.format]][0]) ||
                    ConditionFilter.equal;

                // if the new filter is after a separator, don't set operator
                // separator key is the filters length when separator was add
                const lastFilterIsSeparatorCondition = flatArray(separators).some(
                    separator => separator.key === filters.length + index - 1
                );

                const attributeFormat = attributeChecked?.format ?? AttributeFormat.text;

                return {
                    type: FilterTypes.filter,
                    key: filters.length + index,
                    id: getUniqueId(),
                    operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                    condition: defaultConditionOptions,
                    value: _getDefaultFilterValueByFormat(attributeFormat),
                    attribute,
                    active: true,
                    format: attributeFormat,
                    originAttributeData: attributeChecked.parentAttributeData,
                    treeData: attributeChecked.treeData,
                    extendedData: {...attributeChecked.embeddedFieldData, path: attributeChecked.path}
                };
            });

            return [...filters, newFilters] as Array<Array<IFilter | IFilterSeparator>>;
        });

        setShowAttr(false);
        setAttributesChecked([]);
        updateFilters();
    };

    const handleCancel = () => {
        setAttributesChecked([]);
        setShowAttr(false);
    };

    return (
        <Modal
            visible={showAttr}
            onCancel={() => setShowAttr(false)}
            title={t('filters.modal-header')}
            width="70rem"
            centered
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('attributes-list.cancel')}
                </Button>,
                <Button key="add" type="primary" onClick={addFilters}>
                    {t('attributes-list.add')}
                </Button>
            ]}
            destroyOnClose
        >
            <AttributesSelectionList
                library={activeLibrary?.id ?? ''}
                selectedAttributes={attributesChecked}
                onSelectionChange={setAttributesChecked}
            />
        </Modal>
    );
}

export default AddFilter;
