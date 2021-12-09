// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SelectionModeContext} from 'context';
import React, {useContext} from 'react';
import {Cell as ReactTableTypeCell} from 'react-table';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import {infosCol, selectionColumn} from '../../../../constants/constants';
import {ITableRow, SharedStateSelectionType} from '../../../../_types/types';
import Cell from '../Cell';
import CellSelection from '../Cell/CellSelection';

const CustomBodyCell = styled.div<{id?: string | number}>`
    max-width: ${p => (p.id === selectionColumn ? '35px' : 'auto')};
`;

interface IBodyCellProps {
    cell: ReactTableTypeCell<ITableRow>;
    selected: boolean;
}

function BodyCell({cell, selected}: IBodyCellProps): JSX.Element {
    const props = cell.getCellProps();
    const record = cell.row.original.record;

    const selectionMode = useContext(SelectionModeContext);
    const dispatch = useAppDispatch();

    if (cell.column.id === infosCol) {
        // define info column row style
        props.style = {
            ...props.style,
            flex: '1 0 auto',
            maxWidth: '250px',
            minWidth: '250px',
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

    if (!cell.value) {
        return <CustomBodyCell {...props}></CustomBodyCell>;
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

    return (
        <CustomBodyCell {...props} id={cell.column.id} className="body-cell">
            {cell.column.id === selectionColumn ? (
                <CellSelection record={record} onClick={_handleCellSelected} selected={selected} />
            ) : (
                <Cell columnName={cell.column.id} data={data} />
            )}
        </CustomBodyCell>
    );
}

export default BodyCell;
