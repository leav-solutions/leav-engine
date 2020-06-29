import React, {useState} from 'react';
import {Button, Modal} from 'semantic-ui-react';
import {allowedTypeOperator} from '../../../../../utils';
import {AttributeFormat, conditionFilter, FilterTypes, IFilter, IFilterSeparator} from '../../../../../_types/types';
import ListAttributes from '../../../../ListAttributes';
import {LibraryItemListState} from '../../../LibraryItemsListReducer';

interface IChangeAttributeProps {
    stateItems: LibraryItemListState;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
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
    const [attSelected, setAttSelected] = useState<string>(filter.attribute);

    const handleCancel = () => {
        setShowModal(false);
    };

    const changeAttribute = () => {
        const newAtt = stateItems.attributes.find(a => a.id === attSelected);

        // take the first operator for the format of the attribute
        const defaultWhereOperator = allowedTypeOperator[AttributeFormat[newAtt?.format ?? 0]][0];

        setFilters(filters =>
            filters.reduce((acc, f) => {
                if (f.type === FilterTypes.filter && f.key === filter.key) {
                    return [
                        ...acc,
                        {
                            ...f,
                            attribute: attSelected,
                            format: newAtt?.format,
                            condition: conditionFilter[defaultWhereOperator]
                        } as IFilter
                    ];
                }

                return [...acc, f];
            }, [] as (IFilter | IFilterSeparator)[])
        );
        setShowModal(false);
    };

    return (
        <Modal open={showModal} onClose={() => setShowModal(false)} closeIcon>
            <Modal.Content>
                <ListAttributes
                    attributes={stateItems.attributes}
                    attributeSelection={attSelected}
                    changeSelected={newAttSelected => setAttSelected(newAttSelected)}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button secondary onClick={handleCancel}>
                    Cancel
                </Button>
                <Button primary onClick={changeAttribute}>
                    Change attribute
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ChangeAttribute;
