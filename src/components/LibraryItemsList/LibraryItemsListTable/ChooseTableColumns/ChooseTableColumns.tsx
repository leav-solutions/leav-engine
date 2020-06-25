import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, CheckboxProps, List, Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import {IAttribute} from '../../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

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

    const [columns, setColumns] = useState(stateItems.columns);

    const handleColumnsUpdate = (attribute: IAttribute, data: CheckboxProps) => {
        const restColumns = columns.filter(col => col.id !== attribute.id);

        if (data.checked) {
            setColumns([...restColumns, {id: attribute.id}]);
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
                <List divided>
                    {stateItems.attributes.map(attribute => (
                        <List.Item key={attribute.id}>
                            <Wrapper>
                                <div>{attribute.id}</div>
                                <Checkbox
                                    checked={!!columns.find(col => attribute.id === col.id)}
                                    onClick={(event, data) => handleColumnsUpdate(attribute, data)}
                                />
                            </Wrapper>
                        </List.Item>
                    ))}
                </List>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleCancel} secondary>
                    {t('table-columns-selection.cancel')}
                </Button>
                <Button onClick={handleSubmit} positive>
                    {t('table-columns-selection.submit')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ChooseTableColumns;
