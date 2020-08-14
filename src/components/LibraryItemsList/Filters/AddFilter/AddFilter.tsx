import {Button, Modal} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {allowedTypeOperator} from '../../../../utils';
import {
    AttributeFormat,
    ConditionFilter,
    FilterTypes,
    IAttribute,
    IAttributesChecked,
    IFilter,
    IFilterSeparator
} from '../../../../_types/types';
import ListAttributes from '../../../ListAttributes';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';

interface IAttributeListProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    showAttr: boolean;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
    updateFilters: () => void;
}

function AddFilter({
    stateItems,
    dispatchItems,
    setFilters,
    showAttr,
    setShowAttr,
    updateFilters
}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const [attributesChecked, setAttributesChecked] = useState<IAttributesChecked[]>([]);

    const [newAttributes, setNewAttributes] = useState<IAttribute[]>([]);

    const addFilters = () => {
        const noDuplicateNewAttribute = newAttributes.filter(
            newAttribute =>
                !stateItems.attributes.some(
                    attribute => attribute.id === newAttribute.id && attribute.library === newAttribute.library
                )
        );

        const allAttributes = [...stateItems.attributes, ...noDuplicateNewAttribute];

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ATTRIBUTES,
            attributes: allAttributes
        });

        setFilters(filters => {
            const separators = filters.filter(filter => filter.type === FilterTypes.separator);
            const newFilters: IFilter[] = attributesChecked.map((attributeChecked, index) => {
                if (attributeChecked?.extendedData) {
                    const format = attributeChecked.extendedData.format;
                    const defaultConditionOptions =
                        (format && allowedTypeOperator[AttributeFormat[format]][0]) || ConditionFilter.equal;

                    const lastFilterIsSeparatorCondition = separators.some(
                        separator => separator.key === filters.length + index - 1
                    );

                    const attributeId = attributeChecked.extendedData.path.split('.').pop() ?? '';

                    const newFilter: IFilter = {
                        type: FilterTypes.filter,
                        key: filters.length + index,
                        operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                        condition: defaultConditionOptions,
                        value: '',
                        attributeId,
                        active: true,
                        format,
                        originAttributeData: attributeChecked.originAttributeData,
                        treeData: attributeChecked.treeData,
                        extendedData: attributeChecked.extendedData
                    };
                    return newFilter;
                }

                const attribute = stateItems.attributes.find(
                    attribute => attribute.id === attributeChecked.id && attribute.library === attributeChecked.library
                );

                // take the first operator for the format of the attribute
                const defaultConditionOptions =
                    (attribute?.format && allowedTypeOperator[AttributeFormat[attribute?.format]][0]) ||
                    ConditionFilter.equal;

                // if the new filter is after a separator, don't set operator
                // separator key is the filters length when separator was add
                const lastFilterIsSeparatorCondition = separators.some(
                    separator => separator.key === filters.length + index - 1
                );

                return {
                    type: FilterTypes.filter,
                    key: filters.length + index,
                    operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                    condition: defaultConditionOptions,
                    value: '',
                    attributeId: attributeChecked.id,
                    active: true,
                    format: attribute?.format ?? AttributeFormat.text,
                    originAttributeData: attributeChecked.originAttributeData,
                    treeData: attributeChecked.treeData,
                    extendedData: attributeChecked.extendedData
                };
            });

            return [...filters, ...newFilters] as (IFilter | IFilterSeparator)[];
        });
        setShowAttr(false);
        setAttributesChecked([]);
        updateFilters();
    };

    const handleCancel = () => {
        setShowAttr(false);
    };

    return (
        <Modal
            visible={showAttr}
            onCancel={() => setShowAttr(false)}
            title={t('filters.modal-header')}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('attribute-list.cancel')}
                </Button>,
                <Button key="add" type="primary" onClick={addFilters}>
                    {t('attribute-list.add')}
                </Button>
            ]}
        >
            <ListAttributes
                attributes={stateItems.attributes}
                useCheckbox
                setAttributesChecked={setAttributesChecked}
                setNewAttributes={setNewAttributes}
            />
        </Modal>
    );
}

export default AddFilter;
