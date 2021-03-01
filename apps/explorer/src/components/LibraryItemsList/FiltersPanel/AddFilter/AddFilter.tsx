// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import {useStateItem} from 'Context/StateItemsContext';
import {setFilters} from 'hooks/FiltersStateHook/FilterReducerAction';
import useStateFilters from 'hooks/FiltersStateHook/FiltersStateHook';
import moment from 'moment';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {defaultFilterConditionByAttributeFormat, getFieldsKeyFromAttribute} from 'utils';
import {useActiveLibrary} from '../../../../hooks/ActiveLibHook/ActiveLibHook';
import {AttributeFormat, IFilter, ISelectedAttribute} from '../../../../_types/types';
import AttributesSelectionList from '../../../AttributesSelectionList';

interface IAttributeListProps {
    showAttr: boolean;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
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

function AddFilter({showAttr, setShowAttr}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const {stateItems} = useStateItem();
    const [stateFilters, dispatchFilters] = useStateFilters();

    const [activeLibrary] = useActiveLibrary();

    const [attributesChecked, setAttributesChecked] = useState<ISelectedAttribute[]>([]);

    const addFilters = () => {
        let filterIndex = stateFilters.filters.length + 1;
        const newFilters: IFilter[] = attributesChecked.map(attributeChecked => {
            const attribute = stateItems.attributes.find(
                att => att.id === attributeChecked.id && att.library === attributeChecked.library
            );

            const key = getFieldsKeyFromAttribute(attributeChecked);

            const filter = {
                index: filterIndex++,
                key,
                active: true,
                condition: defaultFilterConditionByAttributeFormat(attribute.format),
                attribute,
                value: _getDefaultFilterValueByFormat(attribute.format)
            };
            return filter;
        });

        dispatchFilters(setFilters([...stateFilters.filters, ...newFilters]));

        setShowAttr(false);
        setAttributesChecked([]);
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
