import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, CheckboxProps, Grid, Popup, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {IItem} from '../../../../_types/types';
import RecordCard from '../../../shared/RecordCard';
import LibraryItemsModal from './LibraryItemsModal';

interface RowProps {
    selected: boolean;
}

const TableRow = styled(Table.Row)<RowProps>`
    background: ${({selected}) => (selected ? 'hsla(202, 100%, 50%, 0.15)' : 'none')};
`;

interface ActionsProps {
    display: 1 | 0;
}

const Actions = styled.div<ActionsProps>`
    position: absolute;
    right: 0;
    padding: 0 1rem;
    display: ${({display}) => (display ? 'flex' : 'none')};
    align-items: center;
    &:hover {
        display: block;
    }
`;

interface ILibraryItemsListTableRowProps {
    item: IItem;
    modeSelection: boolean;
    setModeSelection: React.Dispatch<React.SetStateAction<boolean>>;
    selected: {[x: string]: boolean};
    setSelected: React.Dispatch<React.SetStateAction<{[x: string]: boolean}>>;
}
function LibraryItemsListTableRow({
    item,
    modeSelection,
    setModeSelection,
    selected,
    setSelected
}: ILibraryItemsListTableRowProps): JSX.Element {
    const {t} = useTranslation();

    const [isHover, setIsHover] = useState(false);
    const [showRecordEdition, setShowModalEdition] = useState(false);
    const [values, setValues] = useState(item);
    const [isSelected, setIsSelect] = useState<boolean>(!!selected[item.id]);

    const switchMode = () => {
        setModeSelection(mode => !mode);
        setSelected(s => ({...s, [item.id]: true}));
    };

    const handleShowModal = () => {
        setShowModalEdition(true);
    };

    const handleCheckboxChange = (event: React.FormEvent<HTMLInputElement>, {checked}: CheckboxProps) => {
        setIsSelect(s => !s);
        setSelected(s => ({...s, [item.id]: !!checked}));
    };

    const handleClickRow = () => {
        if (modeSelection) {
            setIsSelect(s => !s);
            setSelected(s => ({...s, [item.id]: !isSelected}));
        }
    };

    useEffect(() => {
        setIsSelect(selected[item.id]);
    }, [selected, item]);

    return (
        <>
            <TableRow
                key={item.id}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                selected={isSelected}
                onClick={handleClickRow}
            >
                <Table.Cell>
                    <Grid>
                        <Grid.Row>
                            <RecordCard record={{...item}} />

                            <Actions display={isHover ? 1 : 0}>
                                {modeSelection ? (
                                    <Button.Group size="small">
                                        <Checkbox onChange={handleCheckboxChange} checked={isSelected} />
                                    </Button.Group>
                                ) : (
                                    <Button.Group size="small">
                                        <Popup
                                            hoverable={false}
                                            onMouseLeave={() => setIsHover(false)}
                                            content={t('items-list-row.switch-to-selection-mode')}
                                            trigger={
                                                <Button active={modeSelection} icon="check" onClick={switchMode} />
                                            }
                                        />
                                        <Popup
                                            hoverable={false}
                                            onMouseLeave={() => setIsHover(false)}
                                            content={t('items-list-row.edit')}
                                            trigger={<Button icon="write" onClick={handleShowModal} />}
                                        />
                                        <Button icon="like" />
                                        <Button icon="ellipsis horizontal" />
                                    </Button.Group>
                                )}
                            </Actions>
                        </Grid.Row>
                    </Grid>
                </Table.Cell>

                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
            </TableRow>

            <LibraryItemsModal
                showModal={showRecordEdition}
                setShowModal={setShowModalEdition}
                values={values}
                setValues={setValues}
            />
        </>
    );
}

export default LibraryItemsListTableRow;
