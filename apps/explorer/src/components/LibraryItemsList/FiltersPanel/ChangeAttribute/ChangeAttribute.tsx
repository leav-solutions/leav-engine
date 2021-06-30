// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import {setFilters} from 'hooks/FiltersStateHook/FilterReducerAction';
import useStateFilters from 'hooks/FiltersStateHook/FiltersStateHook';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {RecordFilterCondition} from '_gqlTypes/globalTypes';
import {useActiveLibrary} from '../../../../hooks/ActiveLibHook/ActiveLibHook';
import {
    defaultFilterConditionByAttributeFormat,
    defaultFilterValueByAttributeFormat,
    getFieldsKeyFromAttribute
} from '../../../../utils';
import {IFilter, ISelectedAttribute} from '../../../../_types/types';
import AttributesSelectionList from '../../../AttributesSelectionList';

interface IChangeAttributeProps {
    filter: IFilter;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

function ChangeAttribute({filter, showModal, setShowModal}: IChangeAttributeProps): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState} = useSearchReducer();
    const {stateFilters, dispatchFilters} = useStateFilters();

    const [activeLibrary] = useActiveLibrary();

    const currentAttribute = searchState.attributes.find(
        att => att.id === filter.attribute.id && att.library === filter.attribute.library
    );

    let parentSelectedAttribute: ISelectedAttribute | undefined;

    if (currentAttribute) {
        parentSelectedAttribute = {
            id: currentAttribute.id,
            library: currentAttribute?.library ?? '',
            path: currentAttribute.id,
            label: currentAttribute.label,
            parentAttributeData: currentAttribute.parentAttributeData,
            type: currentAttribute.type,
            multiple_values: false
        };
    }

    const initialAttSelected = parentSelectedAttribute ? [parentSelectedAttribute] : [];
    const [attrsSelected, setAttrsSelected] = useState<ISelectedAttribute[]>(initialAttSelected);

    const handleCancel = () => {
        setShowModal(false);
        setAttrsSelected(initialAttSelected);
    };

    const changeAttribute = () => {
        const newFilters: IFilter[] = stateFilters.filters.map(f => {
            if (f.index === filter.index) {
                const attrSelected = attrsSelected[0];

                const attributeFind = searchState.attributes.find(
                    att => att.id === attrSelected.id && att.library === attrSelected.library
                );

                if (attributeFind) {
                    const key = getFieldsKeyFromAttribute(attributeFind);

                    return {
                        ...filter,
                        key,
                        attribute: attributeFind,
                        condition: RecordFilterCondition[defaultFilterConditionByAttributeFormat(attributeFind.format)],
                        value: {value: defaultFilterValueByAttributeFormat(attributeFind.format)}
                    };
                } else {
                    throw new Error('attribute selected not found');
                }
            }
            return f;
        });

        dispatchFilters(setFilters(newFilters));

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
                <PrimaryBtn key="submit" onClick={changeAttribute}>
                    {t('change-attribute.submit')}
                </PrimaryBtn>
            ]}
        >
            <AttributesSelectionList
                library={activeLibrary?.id ?? ''}
                selectedAttributes={attrsSelected}
                onSelectionChange={setAttrsSelected}
                multiple={false}
                data-testid="attribute-selection-list"
            />
        </Modal>
    );
}

export default ChangeAttribute;
