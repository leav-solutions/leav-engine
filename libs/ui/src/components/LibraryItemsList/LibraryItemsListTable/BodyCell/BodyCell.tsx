// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Cell as ReactTableTypeCell} from 'react-table';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {ITableRow} from '_ui/types/search';
import {infosCol, INFOS_COLUMN_WIDTH, selectionColumn} from '../../constants';
import useSearchReducer from '../../hooks/useSearchReducer';
import Cell from '../Cell';
import CellSelection from '../Cell/CellSelection';

const CustomBodyCell = styled.div<{id?: string | number; selected: boolean}>`
    // Inherit background from row. If background is transparent, the sticky column won't behave properly
    background-color: inherit;
    padding: 4px 0;

    &:not(:first-child) {
        border-left: 1px solid ${props => (props.selected ? themeVars.activeColor : themeVars.borderLightColor)};
    }

    max-width: ${p => (p.id === selectionColumn ? '35px' : 'auto')};

    display: flex;
    align-items: center;
`;

const ErrorBodyCell = styled(CustomBodyCell)`
    color: var(--general-colors-secondary-red-red400);
    background-color: var(--general-colors-secondary-red-red100);
    padding: calc(var(--general-spacing-xxs) * 1px);
`;

interface IBodyCellProps {
    cell: ReactTableTypeCell<ITableRow>;
    selected: boolean;
}

function BodyCell({cell, selected}: IBodyCellProps): JSX.Element {
    const searchReducer = useSearchReducer();
    const props = cell.getCellProps();
    if (cell.column.id === infosCol) {
        // define info column row style
        props.style = {
            ...props.style,
            flex: '1 0 auto',
            maxWidth: INFOS_COLUMN_WIDTH,
            minWidth: INFOS_COLUMN_WIDTH,
            zIndex: 3
        };
    }

    const cellError = searchReducer.state.errors.find(
        err => err.extensions.record?.id === cell.row.original.record.id && err.extensions.fields[cell.column.id]
    );

    const data = {
        id: cell?.value?.id,
        key: cell?.value?.id,
        library: cell?.value?.library,
        label: cell?.value?.label,
        value: cell?.value?.value,
        type: cell?.value?.type,
        format: cell?.value?.format
    };

    if (cellError) {
        return (
            <ErrorBodyCell selected={selected} {...props}>
                {cellError.extensions.fields[cell.column.id] ?? cellError.message}
            </ErrorBodyCell>
        );
    }

    return (
        <CustomBodyCell {...props} id={cell.column.id} selected={selected} className="body-cell">
            {cell.column.id === selectionColumn ? (
                <CellSelection selected={selected} />
            ) : (
                <Cell columnName={cell.column.id} data={data} />
            )}
        </CustomBodyCell>
    );
}

export default BodyCell;
