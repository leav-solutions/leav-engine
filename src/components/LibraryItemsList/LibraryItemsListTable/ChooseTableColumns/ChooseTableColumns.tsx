import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
import {AttributeType, IAttribute, IAttributesChecked, IItemsColumn} from '../../../../_types/types';
import ListAttributes from '../../../ListAttributes';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';

interface IChooseTableColumnsProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    openChangeColumns: boolean;
    setOpenChangeColumns: (openChangeColumns: boolean) => void;
}

function ChooseTableColumns({
    stateItems,
    dispatchItems,
    openChangeColumns,
    setOpenChangeColumns
}: IChooseTableColumnsProps): JSX.Element {
    const {t} = useTranslation();

    const [attributesChecked, setAttributesChecked] = useState<IAttributesChecked[]>(
        stateItems.columns.map(col => ({
            id: col.id,
            library: col.library,
            depth: 0,
            checked: true
        }))
    );

    const [newAttributes, setNewAttributes] = useState<IAttribute[]>([]);

    const handleSubmit = () => {
        const noDuplicateNewAttribute = newAttributes.filter(
            newAttribute =>
                !stateItems.attributes.find(
                    attribute => attribute.id === newAttribute.id && attribute.library === newAttribute.library
                )
        );

        const allAttributes = [...stateItems.attributes, ...noDuplicateNewAttribute];

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ATTRIBUTES,
            attributes: allAttributes
        });

        const newColumns: IItemsColumn[] = attributesChecked.reduce((acc, attributeChecked) => {
            if (attributeChecked.checked) {
                const attribute = allAttributes.find(
                    attribute => attribute.id === attributeChecked.id && attribute.library === attributeChecked.library
                );

                return [
                    ...acc,
                    {
                        id: attributeChecked.id,
                        library: attributeChecked.library,
                        type: attribute ? attribute.type : AttributeType.simple,
                        originAttributeId: attributeChecked.originAttributeId
                    }
                ];
            }
            return acc;
        }, [] as IItemsColumn[]);

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_COLUMNS,
            columns: newColumns
        });
        setOpenChangeColumns(false);
    };

    const handleCancel = () => {
        setOpenChangeColumns(false);
    };

    return (
        <Modal open={openChangeColumns} onClose={() => setOpenChangeColumns(false)} closeIcon size="small">
            <Modal.Header>{t('table-columns-selection.header')}</Modal.Header>
            <Modal.Content>
                <ListAttributes
                    attributes={stateItems.attributes}
                    useCheckbox
                    attributesChecked={attributesChecked}
                    setAttributesChecked={setAttributesChecked}
                    setNewAttributes={setNewAttributes}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleCancel}>{t('table-columns-selection.cancel')}</Button>
                <Button onClick={handleSubmit} primary>
                    {t('table-columns-selection.submit')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ChooseTableColumns;
