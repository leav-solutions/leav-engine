// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useContext, useState} from 'react';
import {Cell as ReactTableTypeCell} from 'react-table';
import styled from 'styled-components';
import {infosCol} from '../../../../constants/constants';
import themingVar from '../../../../themingVar';
import Cell from '../Cell';
import {SelectionModeContext} from 'context';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {SharedStateSelectionType} from '../../../../_types/types';
import EditRecordModal from '../../../RecordEdition/EditRecordModal';

const CustomBodyCell = styled.div<{selected: boolean}>`
    background-color: ${p =>
        p.selected ? themingVar['@leav-view-panel-label-background-active'] : themingVar['@default-bg']};
`;

interface IBodyCellProps {
    cell: ReactTableTypeCell<any, any>;
    index: string;
}

function BodyCell({cell, index}: IBodyCellProps): JSX.Element {
    const props = cell.getCellProps();

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
            width: '250px'
        };
    }

    const data = {
        id: cell.value.id,
        key: cell.value.id,
        library: cell.value.library,
        label: cell.value.label,
        value: cell.value.value,
        type: cell.value.type,
        format: cell.value.format
    };

    const allSelected =
        selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected;

    const selected =
        selectionState.selection.type === SharedStateSelectionType.search &&
        !!selectionState.selection.selected.find(e => e.id === data.id && e.library === data.library);

    if (!cell.value) {
        return <CustomBodyCell selected={selected} {...props}></CustomBodyCell>;
    }

    const _handleCellSelected = () => {
        const selectionData = {id: data.id, library: data.library, label: data.label};

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

    const _handleClose = () => {
        setEditRecordModal(false);
    };

    return (
        <CustomBodyCell
            {...props}
            selected={allSelected || selected}
            onClick={_handleCellSelected}
            onDoubleClick={() => setEditRecordModal(true)}
            className="body-cell"
        >
            <div>
                {editRecordModal && (
                    <EditRecordModal open={editRecordModal} record={data.value} onClose={_handleClose} />
                )}
                <Cell columnName={cell.column.id} data={data} index={index} />
            </div>
        </CustomBodyCell>
    );
}

export default BodyCell;
