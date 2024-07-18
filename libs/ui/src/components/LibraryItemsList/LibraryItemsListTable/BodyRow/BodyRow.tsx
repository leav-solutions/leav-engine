// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext} from 'react';
import {Row} from 'react-table';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {IItem} from '_ui/types/search';
import {SearchActionTypes} from '../../hooks/useSearchReducer/searchReducer';
import BodyCell from '../BodyCell';
import EditRecordModalContext from '../EditRecordModalContext';

const CustomBodyRow = styled.div<{$selected: boolean}>`
    position: relative;
    border-bottom: 1px solid ${props => (props.$selected ? themeVars.activeColor : themeVars.borderLightColor)};
    border-collapse: collapse;

    // Must set background on row for the case where we just have the infos column (part of the row is empty)
    background-color: ${p => (p.$selected ? themeVars.activeColor : themeVars.defaultBg)};

    &:not(:hover) .floating-menu {
        display: none;
    }

    &:hover {
        background-color: ${p => (p.$selected ? themeVars.activeColor : `${themeVars.activeColor}`)};
    }
`;

interface IBodyRowProps {
    row: Row<IItem | any>; // react-table typing fail
}

function BodyRow({row}: IBodyRowProps): JSX.Element {
    const props = row.getRowProps();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const {editRecord} = useContext(EditRecordModalContext);

    const record = row.cells[0]?.row?.original?.record;

    if (!row.cells.length || typeof record === 'undefined') {
        return <></>;
    }

    const isRecordSelected = !!searchState.selection.selected.find(
        e => e.id === record.id && e.library === searchState.library.id
    );
    const isAllSelected = searchState.selection.allSelected;

    const isRowSelected = isAllSelected || isRecordSelected;

    const _handleCellSelected = () => {
        const selectionData = {id: record.id, library: record.library.id, label: record.label};

        searchDispatch({
            type: SearchActionTypes.TOGGLE_RECORD_SELECTION,
            record: selectionData
        });
    };

    const _handleDoubleClick = () => {
        editRecord({
            open: true,
            library: record.library.id,
            record,
            onClose: () => null,
            valuesVersion: searchState.valuesVersions
        });
    };

    return (
        <CustomBodyRow
            {...props}
            onClick={_handleCellSelected}
            onDoubleClick={_handleDoubleClick}
            $selected={isRowSelected}
        >
            {row.cells.map(cell => (
                <BodyCell selected={isRowSelected} cell={cell as any} key={cell.column.id} />
            ))}
        </CustomBodyRow>
    );
}

export default BodyRow;
