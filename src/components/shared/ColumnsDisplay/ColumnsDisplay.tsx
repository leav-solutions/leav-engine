import React from 'react';
import styled from 'styled-components';

interface IColumnsDisplayProps {
    columnsNumber: number;
    columnsContent: JSX.Element[];
}

interface IColumnProps {
    columnsNumber: number;
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    height: 100%;
`;

const Column = styled.div<IColumnProps>`
    position: relative;
    padding-left: 1em;
    flex-direction: column;
    display: flex;
    text-align: center;
    border-right: 1px solid #999999;
    width: ${props => 100 / props.columnsNumber + '%'}

    &:last-child {
        border-right: none;
    }
`;

function ColumnsDisplay({columnsContent, columnsNumber}: IColumnsDisplayProps): JSX.Element {
    return (
        <Wrapper>
            {columnsContent.map((c, i) => (
                <Column columnsNumber={columnsNumber} key={i}>
                    {c}
                </Column>
            ))}
        </Wrapper>
    );
}

export default ColumnsDisplay;
