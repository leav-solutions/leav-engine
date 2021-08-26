// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SelectionModeContext} from 'context';
import React, {useContext, useState} from 'react';
import {Cell as ReactTableTypeCell} from 'react-table';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {infosCol, selectionColumn} from '../../../../constants/constants';
import themingVar from '../../../../themingVar';
import {ITableRow, SharedStateSelectionType} from '../../../../_types/types';
import EditRecordModal from '../../../RecordEdition/EditRecordModal';
import Cell from '../Cell';
import CellSelection from '../Cell/CellSelection';

const CustomBodyCell = styled.div<{selected: boolean; id?: string | number}>`
    max-width: ${p => (p.id === selectionColumn ? '35px' : 'auto')};
    background-color: ${p =>
        p.selected ? themingVar['@leav-view-panel-label-background-active'] : themingVar['@default-bg']};
`;

interface IBodyCellProps {
    cell: ReactTableTypeCell<ITableRow>;
    index: string;
}

function BodyCell({cell, index}: IBodyCellProps): JSX.Element {
    const props = cell.getCellProps();
    const record = cell.row.original.record;

    const selectionMode = useContext(SelectionModeContext);
    const [editRecordModal, setEditRecordModal] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));

    if (cell.column.id === infosCol) {
        // define info column row style
        props.style = {
            ...props.style,
            flex: '1 0 auto',
            width: '250px',
            zIndex: 'auto'
        };
    }

    const data = {
        id: cell?.value?.id,
        key: cell?.value?.id,
        library: cell?.value?.library,
        label: cell?.value?.label,
        value: cell?.value?.value,
        type: cell?.value?.type,
        format: cell?.value?.format
    };

    const allSelected =
        selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected;

    const selected =
        selectionState.selection.type === SharedStateSelectionType.search &&
        !!selectionState.selection.selected.find(e => e.id === record.id && e.library === record.library.id);

    if (!cell.value) {
        return <CustomBodyCell selected={selected} {...props}></CustomBodyCell>;
    }

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

    const isRowSelected = allSelected || selected;

    return (
        <CustomBodyCell
            {...props}
            id={cell.column.id}
            selected={isRowSelected}
            onClick={_handleCellSelected}
            onDoubleClick={_handleDoubleClick}
            className="body-cell"
        >
            {editRecordModal && <EditRecordModal open={editRecordModal} record={record} onClose={_handleClose} />}
            {cell.column.id === selectionColumn ? (
                <CellSelection record={record} onClick={_handleCellSelected} selected={isRowSelected} />
            ) : (
                <Cell columnName={cell.column.id} data={data} index={index} record={record} />
            )}
        </CustomBodyCell>
    );
}

export default BodyCell;
