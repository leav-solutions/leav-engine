import {Button, Modal} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {allowedTypeOperator} from '../../../../../utils';
import {
    AttributeFormat,
    ConditionFilter,
    FilterTypes,
    IAttribute,
    IFilter,
    IFilterSeparator
} from '../../../../../_types/types';
import ListAttributes from '../../../../ListAttributes';
import {LibraryItemListState} from '../../../LibraryItemsListReducer';

interface IChangeAttributeProps {
    stateItems: LibraryItemListState;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[][]>>;
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
    const [attSelected, setAttSelected] = useState<string>(filter.attributeId);

    const [, setNewAttributes] = useState<IAttribute[]>([]);

    const handleCancel = () => {
        setShowModal(false);
        setAttSelected(filter.attributeId);
    };

    const changeAttribute = () => {
        const newAtt = stateItems.attributes.find(a => a.id === attSelected);

        // take the first operator for the format of the attribute
        const defaultConditionOperator =
            allowedTypeOperator[AttributeFormat[newAtt?.format ?? 0]] &&
            allowedTypeOperator[AttributeFormat[newAtt?.format ?? 0]][0];

        setFilters(filters =>
            filters.map(filterGroup =>
                filterGroup.reduce((acc, f) => {
                    if (f.type === FilterTypes.filter && f.key === filter.key) {
                        return [
                            ...acc,
                            {
                                ...f,
                                attributeId: attSelected,
                                format: newAtt?.format,
                                condition: ConditionFilter[defaultConditionOperator]
                            } as IFilter
                        ];
                    }

                    return [...acc, f];
                }, [] as (IFilter | IFilterSeparator)[])
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
            <ListAttributes
                attributes={stateItems.attributes}
                attributeSelection={attSelected}
                changeSelected={newAttSelected => setAttSelected(newAttSelected)}
                setNewAttributes={setNewAttributes}
            />
        </Modal>
    );
}

export default ChangeAttribute;
