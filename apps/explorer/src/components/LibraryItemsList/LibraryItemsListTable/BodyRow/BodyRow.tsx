// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SelectionModeContext} from 'context';
import React, {useContext, useState} from 'react';
import {Row} from 'react-table';
import styled from 'styled-components';
import themingVar from '../../../../themingVar';
import {IItem, SharedStateSelectionType} from '../../../../_types/types';
import BodyCell from '../BodyCell';
import {isSelected, isAllSelected} from '../BodyCell/getSelectedCell';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import EditRecordModal from '../../../RecordEdition/EditRecordModal';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';

const CustomBodyRow = styled.div<{selected: boolean}>`
    transition: 100ms ease;
    position: relative;
    border: 2px solid transparent;

    background-color: ${p =>
        p.selected ? themingVar['@leav-view-panel-label-background-active'] : themingVar['@default-bg']};

    &:not(:hover) .floating-menu {
        display: none;
    }

    &:hover {
        border: 2px solid ${themingVar['@primary-color']};
    }
`;

interface IBodyRowProps {
    row: Row<IItem | any>; // react-table typing fail
    index: string;
}

function BodyRow({row, index}: IBodyRowProps): JSX.Element {
    const props = row.getRowProps();
    const selectionMode = useContext(SelectionModeContext);
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));
    const [editRecordModal, setEditRecordModal] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    const record = row.cells[0]?.row?.original?.record;

    if (!row.cells.length || typeof record === 'undefined') {
        return <></>;
    }

    const selected = isSelected(selectionState, selectionMode, record.id, record.library.id);
    const allSelected = isAllSelected(selectionState, selectionMode);

    const isRowSelected = allSelected || selected;

    const _handleCellSelected = () => {
        const selectionData = {id: record.id, library: record.library.id, label: record.label};

        if (selectionMode) {
            dispatch(setSelectionToggleSearchSelectionElement(selectionData));
        } else {
            dispatch(
                setSelectionToggleSelected({
                    selectionType: SharedStateSelectionType.search,
                    elementSelected: selectionData
                })
            );
        }
    };

    const _handleDoubleClick = () => {
        setEditRecordModal(true);
    };

    const _handleClose = () => {
        setEditRecordModal(false);
    };

    return (
        <CustomBodyRow
            {...props}
            onClick={_handleCellSelected}
            onDoubleClick={_handleDoubleClick}
            selected={isRowSelected}
        >
            {editRecordModal && (
                <EditRecordModal
                    open={editRecordModal}
                    library={record.library.id}
                    record={record as RecordIdentity_whoAmI}
                    onClose={_handleClose}
                />
            )}
            {row.cells.map(cell => (
                <BodyCell selected={isRowSelected} cell={cell as any} index={index} key={cell.column.id} />
            ))}
        </CustomBodyRow>
    );
}

export default BodyRow;
