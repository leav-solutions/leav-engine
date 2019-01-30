import * as React from 'react';
import styled from 'styled-components';

interface IColumnsDisplayProps {
    columnsNumber: number;
    columnsContent: JSX.Element[];
}

function ColumnsDisplay({columnsNumber, columnsContent}: IColumnsDisplayProps): JSX.Element {
    /* tslint:disable-next-line:variable-name */
    const Wrapper = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        height: 100%;
    `;

    /* tslint:disable-next-line:variable-name */
    const Column = styled.div`
        position: relative;
        padding-left: 1em;
        width: ${100 / columnsNumber + '%'};
        flex-direction: column;
        display: flex;
        text-align: center;
        border-right: 1px solid #999999;

        &:last-child {
            border-right: none;
        }
    `;

    return (
        <Wrapper>
            {columnsContent.map((c, i) => (
                <Column key={i}>{c}</Column>
            ))}
        </Wrapper>
    );
}

export default ColumnsDisplay;
