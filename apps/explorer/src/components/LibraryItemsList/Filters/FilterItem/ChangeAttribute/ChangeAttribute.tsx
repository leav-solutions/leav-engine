// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import {ILibraryItemListState} from 'components/LibraryItemsList/LibraryItemsListReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useActiveLibrary} from '../../../../../hooks/ActiveLibHook/ActiveLibHook';
import {allowedTypeOperator} from '../../../../../utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    AttributeFormat,
    ConditionFilter,
    FilterTypes,
    IFilter,
    IFilterSeparator,
    ISelectedAttribute
} from '../../../../../_types/types';
import AttributesSelectionList from '../../../../AttributesSelectionList';

interface IChangeAttributeProps {
    stateItems: ILibraryItemListState;
    setFilters: React.Dispatch<React.SetStateAction<Array<Array<IFilter | IFilterSeparator>>>>;
    filter: IFilter;
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChangeAttribute({
    stateItems,
    setFilters,
    filter,
    showModal,
    setShowModal
}: IChangeAttributeProps): JSX.Element {
    const {t} = useTranslation();

    const [activeLibrary] = useActiveLibrary();

    const currentAttribute = stateItems.attributes.find(att => att.id);

    const originSelectedAttribute: ISelectedAttribute = {
        id: filter.attribute.id,
        library: currentAttribute?.library ?? '',
        path: filter.attribute.id,
        label: filter.attribute.label,
        parentAttributeData: filter.originAttributeData,
        type: filter.attribute.type,
        multiple_values: filter.attribute.multiple_values
    };

    const [attSelected, setAttSelected] = useState<ISelectedAttribute[]>([originSelectedAttribute]);

    const handleCancel = () => {
        setShowModal(false);
        setAttSelected([originSelectedAttribute]);
    };

    const changeAttribute = () => {
        const selection = attSelected[0];
        const attribute: GET_ATTRIBUTES_BY_LIB_attributes_list = {
            ...selection,
            label: selection.label ?? null,
            format: selection.format ?? null,
            embedded_fields: selection.embeddedFieldData ? [selection.embeddedFieldData] : null
        };

        const newAtt = stateItems.attributes.find(a => a.id === attribute.id && a.library === selection.library);

        // take the first operator for the format of the attribute
        const defaultConditionOperator =
            allowedTypeOperator[AttributeFormat[newAtt?.format ?? 0]] &&
            allowedTypeOperator[AttributeFormat[newAtt?.format ?? 0]][0];

        setFilters(filters =>
            filters.map(filterGroup =>
                filterGroup.reduce((acc, f) => {
                    if (f.type === FilterTypes.filter && f.key === filter.key) {
                        const filterToAdd: IFilter = {
                            ...f,
                            attribute,
                            format: newAtt?.format,
                            condition: ConditionFilter[defaultConditionOperator]
                        };
                        return [...acc, filterToAdd];
                    }

                    return [...acc, f];
                }, [] as Array<IFilter | IFilterSeparator>)
            )
        );
        setShowModal(false);
    };

    return (
        <Modal
            visible={showModal}
            onCancel={handleCancel}
            width="70rem"
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('change-attribute.cancel')}
                </Button>,
                <Button key="submit" type="primary" onClick={changeAttribute}>
                    {t('change-attribute.submit')}
                </Button>
            ]}
        >
            <AttributesSelectionList
                library={activeLibrary?.id ?? ''}
                selectedAttributes={attSelected}
                onSelectionChange={setAttSelected}
                multiple={false}
            />
        </Modal>
    );
}

export default ChangeAttribute;
