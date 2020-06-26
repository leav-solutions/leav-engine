import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, CheckboxProps, Grid, Popup, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {displayListItemTypes, IItem} from '../../../../_types/types';
import RecordCard from '../../../shared/RecordCard';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';
import LibraryItemsModal from './LibraryItemsModal';

const getRowHeight = (displayType: displayListItemTypes) => {
    switch (displayType) {
        case displayListItemTypes.listSmall:
            return '3rem';
        case displayListItemTypes.listMedium:
            return '6rem';
        case displayListItemTypes.listBig:
            return '9rem';
        case displayListItemTypes.tile:
            return '0rem';
    }
};

interface RowProps {
    selected: boolean;
    size: displayListItemTypes;
}

const TableRow = styled(Table.Row)<RowProps>`
    height: ${({size}) => getRowHeight(size)};
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
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}
function LibraryItemsListTableRow({item, stateItems, dispatchItems}: ILibraryItemsListTableRowProps): JSX.Element {
    const [isHover, setIsHover] = useState(false);
    const [isSelected, setIsSelect] = useState<boolean>(!!stateItems.itemsSelected[item.id]);

    const handleClickRow = () => {
        if (stateItems.selectionMode) {
            setIsSelect(s => !s);

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
                itemsSelected: {...stateItems.itemsSelected, [item.id]: !isSelected}
            });
        }
    };

    useEffect(() => {
        setIsSelect(stateItems.itemsSelected[item.id]);
    }, [stateItems.itemsSelected, item]);

    return (
        <>
            <TableRow
                key={item.id}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                selected={isSelected}
                onClick={handleClickRow}
                size={stateItems.displayType}
            >
                {stateItems.columns.map(column =>
                    column.id === 'infos' ? (
                        <InfosRow
                            key={column.id}
                            item={item}
                            stateItems={stateItems}
                            dispatchItems={dispatchItems}
                            isSelected={isSelected}
                            setIsSelect={setIsSelect}
                            isHover={isHover}
                            setIsHover={setIsHover}
                        />
                    ) : (
                        <Table.Cell key={column.id}>
                            <div>{item[column.id]?.toString() ?? item[column.id]}</div>
                        </Table.Cell>
                    )
                )}
            </TableRow>
        </>
    );
}

interface IInfosRow {
    item: IItem;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    isSelected: boolean;
    setIsSelect: any;
    isHover: boolean;
    setIsHover: any;
}

const InfosRow = ({item, stateItems, dispatchItems, isSelected, setIsSelect, isHover, setIsHover}: IInfosRow) => {
    const {t} = useTranslation();

    const [showRecordEdition, setShowModalEdition] = useState(false);
    const [values, setValues] = useState(item);

    const handleShowModal = () => {
        setShowModalEdition(true);
    };

    const handleCheckboxChange = (event: React.FormEvent<HTMLInputElement>, {checked}: CheckboxProps) => {
        setIsSelect(s => !s);

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {...stateItems.itemsSelected, [item.id]: !!checked}
        });
    };

    const switchMode = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: !stateItems.selectionMode
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {...stateItems.itemsSelected, [item.id]: true}
        });
    };
    return (
        <>
            <Table.Cell>
                <Grid>
                    <Grid.Row>
                        <RecordCard record={{...item}} />

                        <Actions display={isHover ? 1 : 0}>
                            {stateItems.selectionMode ? (
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
                                            <Button
                                                active={stateItems.selectionMode}
                                                icon="check"
                                                onClick={switchMode}
                                            />
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

            <LibraryItemsModal
                showModal={showRecordEdition}
                setShowModal={setShowModalEdition}
                values={values}
                setValues={setValues}
            />
        </>
    );
};

export default LibraryItemsListTableRow;
