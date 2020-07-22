import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
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
import {LibraryItemListState} from '../../LibraryItemsListReducer';

interface IAttributeListProps {
    stateItems: LibraryItemListState;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    showAttr: boolean;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
    updateFilters: () => void;
}

function AddFilter({stateItems, setFilters, showAttr, setShowAttr, updateFilters}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const [attributesChecked, setAttributesChecked] = useState<IAttributesChecked[]>([]);

    const [, setNewAttributes] = useState<IAttribute[]>([]);

    const addFilters = () => {
        // dispatchItems({
        //     type: LibraryItemListReducerActionTypes.SET_ATTRIBUTES,
        //     attributes: [...stateItems.attributes, ...newAttributes]
        // });

        setFilters(filters => {
            const separators = filters.filter(filter => filter.type === FilterTypes.separator);
            const newFilters: IFilter[] = attributesChecked.map((attributeChecked, index) => {
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
                    format: attribute?.format ?? AttributeFormat.text
                };
            });

            return [...filters, ...newFilters] as (IFilter | IFilterSeparator)[];
        });
        setShowAttr(false);
        setAttributesChecked([]);
        updateFilters();
    };

    // const handleChecked = (attribute: IAttribute, checked: boolean) => {
    //     if (attribute) {
    //         if (checked) {
    //             setAttributesChecked(attSelected => [
    //                 ...attSelected,
    //                 {id: attribute.id, library: attribute.library, depth: 0, checked: true}
    //             ]);
    //         } else {
    //             setAttributesChecked(attSelected => attSelected.filter(att => att.id !== attribute.id));
    //         }
    //     }
    // };

    const handleCancel = () => {
        setShowAttr(false);
    };

    return (
        <Modal open={showAttr} onClose={() => setShowAttr(false)} closeIcon>
            <Modal.Header>{t('filters.modal-header')}</Modal.Header>
            <Modal.Content>
                <ListAttributes
                    attributes={stateItems.attributes}
                    useCheckbox
                    setAttributesChecked={setAttributesChecked}
                    setNewAttributes={setNewAttributes}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleCancel}>{t('attribute-list.cancel')}</Button>
                <Button primary onClick={addFilters}>
                    {t('attribute-list.add')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default AddFilter;
