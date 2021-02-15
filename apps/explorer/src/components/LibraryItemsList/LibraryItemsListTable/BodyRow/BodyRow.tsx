// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Row} from 'react-table';
import styled from 'styled-components';
import themingVar from '../../../../themingVar';
import {IItem} from '../../../../_types/types';
import BodyCell from '../BodyCell';

const CustomBodyRow = styled.div`
    transition: 100ms ease;
    position: relative;
    border: 2px solid transparent;

    &:hover {
        border: 2px solid ${themingVar['@primary-color']};

        .floating-menu {
            display: flex;
        }

        .hidden-checkbox {
            display: flex;
        }
    }
`;

interface IBodyRowProps {
    row: Row<IItem | any>; // react-table typing fail
    index: string;
}

function BodyRow({row, index}: IBodyRowProps): JSX.Element {
    const props = row.getRowProps();

    return (
        <CustomBodyRow {...props}>
            {row.cells.map(cell => (
                <BodyCell cell={cell as any} index={index} key={cell.column.id} />
            ))}
        </CustomBodyRow>
    );
}

export default BodyRow;
