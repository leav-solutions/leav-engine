import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
import {allowedTypeOperator} from '../../../../utils';
import {
    AttributeFormat,
    conditionFilter,
    FilterTypes,
    IAttribute,
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

    const [attSelected, setAttSelected] = useState<{id: string; format: AttributeFormat}[]>([]);

    const addFilters = () => {
        setFilters(filters => {
            const separators = filters.filter(filter => filter.type === FilterTypes.separator);
            const newFilters: IFilter[] = attSelected.map((att, index) => {
                // take the first operator for the format of the attribute
                const defaultConditionOptions = allowedTypeOperator[AttributeFormat[att.format]][0];

                // if the new filter is after a separator, don't set operator
                // separator key is the filters length when separator was add
                const lastFilterIsSeparatorCondition = separators.some(
                    separator => separator.key === filters.length + index - 1
                );

                return {
                    type: FilterTypes.filter,
                    key: filters.length + index,
                    operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                    condition: conditionFilter[defaultConditionOptions],
                    value: '',
                    attribute: att.id,
                    active: true,
                    format: att.format
                };
            });

            return [...filters, ...newFilters] as (IFilter | IFilterSeparator)[];
        });
        setShowAttr(false);
        setAttSelected([]);
        updateFilters();
    };

    const handleChecked = (attribute: IAttribute, checked: boolean) => {
        if (checked) {
            setAttSelected(attSelected => [...attSelected, {id: attribute.id, format: attribute.format}]);
        } else {
            setAttSelected(attSelected => attSelected.filter(att => att.id !== attribute.id));
        }
    };

    const handleCancel = () => {
        setShowAttr(false);
    };

    return (
        <Modal open={showAttr} onClose={() => setShowAttr(false)} closeIcon>
            <Modal.Header>{t('filters.modal-header')}</Modal.Header>
            <Modal.Content>
                <ListAttributes attributes={stateItems.attributes} useCheckbox onCheckboxChange={handleChecked} />
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
