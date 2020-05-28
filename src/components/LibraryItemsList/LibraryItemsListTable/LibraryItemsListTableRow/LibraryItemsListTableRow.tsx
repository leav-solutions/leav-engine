import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, Grid, Popup, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {IItem} from '../../../../_types/types';
import RecordCard from '../../../shared/RecordCard';
import LibraryItemsModal from './LibraryItemsModal';

interface ActionsProps {
    display: 1 | 0;
}

const Actions = styled.div<ActionsProps>`
    position: absolute;
    right: 0;
    display: ${({display}) => (display ? 'block' : 'none')};
    &:hover {
        display: block;
    }
`;

interface ILibraryItemsListTableRowProps {
    item: IItem;
    modeSelection: boolean;
    setModeSelection: (modeSelection: boolean) => void;
}
function LibraryItemsListTableRow({
    item,
    modeSelection,
    setModeSelection
}: ILibraryItemsListTableRowProps): JSX.Element {
    const {t} = useTranslation();

    const [isHover, setIsHover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [values, setValues] = useState(item);

    const switchMode = () => {
        setModeSelection(true);
    };

    const handleShowModal = () => {
        setShowModal(true);
    };

    return (
        <>
            <Table.Row key={item.id} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                {modeSelection && (
                    <Table.Cell>
                        <Checkbox />
                    </Table.Cell>
                )}

                <Table.Cell>
                    <Grid>
                        <Grid.Row>
                            <RecordCard record={{...item}} />
                            <Actions display={isHover ? 1 : 0}>
                                <Button.Group size="small">
                                    <Popup
                                        content={t('items-list-row.switch-to-selection-mode')}
                                        trigger={<Button icon="check" onClick={switchMode} />}
                                    />
                                    <Popup
                                        content={t('items-list-row.edit')}
                                        trigger={<Button icon="write" onClick={handleShowModal} />}
                                    />
                                    <Button icon="like" />
                                    <Button icon="ellipsis horizontal" />
                                </Button.Group>
                            </Actions>
                        </Grid.Row>
                    </Grid>
                </Table.Cell>

                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
            </Table.Row>

            <LibraryItemsModal
                showModal={showModal}
                setShowModal={setShowModal}
                values={values}
                setValues={setValues}
            />
        </>
    );
}

export default LibraryItemsListTableRow;
