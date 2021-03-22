// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Cell as ReactTableTypeCell} from 'react-table';
import styled from 'styled-components';
import {infosCol} from '../../../../constants/constants';
import themingVar from '../../../../themingVar';
import Cell from '../Cell';

const CustomBodyCell = styled.div`
    border-left: 1px solid ${themingVar['@divider-color']};
    border-bottom: 1px solid ${themingVar['@divider-color']};

    &:first-child {
        border-right: 1px solid ${themingVar['@divider-color']};
    }

    &:nth-child(2) {
        border-left: none;
    }

    & > * {
        background: ${themingVar['@default-bg']};
        z-index: 10;
    }
`;

interface IBodyCellProps {
    cell: ReactTableTypeCell<any, any>;
    index: string;
}

function BodyCell({cell, index}: IBodyCellProps): JSX.Element {
    const props = cell.getCellProps();

    if (cell.column.id === infosCol) {
        // define info column row style
        props.style = {...props.style, flex: '1 0 auto', width: '250px', background: themingVar['@default-bg']};
    }

    if (!cell.value) {
        return <CustomBodyCell {...props}></CustomBodyCell>;
    }

    const data = {
        id: cell.value.id,
        library: cell.value.library,
        label: cell.value.label,
        value: cell.value.value,
        type: cell.value.type,
        format: cell.value.format
    };

    return (
        <CustomBodyCell {...props} className="body-cell">
            <div>
                <Cell columnName={cell.column.id} data={data} index={index} />
            </div>
        </CustomBodyCell>
    );
}

export default BodyCell;
