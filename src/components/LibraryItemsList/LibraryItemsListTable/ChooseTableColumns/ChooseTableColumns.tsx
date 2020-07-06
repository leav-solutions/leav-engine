import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
import {IAttribute, IItemsColumn} from '../../../../_types/types';
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

    const [columns, setColumns] = useState<IItemsColumn[]>(stateItems.columns);

    const handleColumnsUpdate = (attribute: IAttribute, checked: boolean) => {
        const restColumns = columns.filter(col => col.id !== attribute.id);

        if (checked) {
            setColumns([
                ...restColumns,
                {
                    id: attribute.id,
                    isLink: attribute.isLink
                }
            ]);
        } else {
            setColumns(restColumns);
        }
    };

    const handleSubmit = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_COLUMNS,
            columns
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
                    attributesChecked={columns}
                    onCheckboxChange={handleColumnsUpdate}
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
