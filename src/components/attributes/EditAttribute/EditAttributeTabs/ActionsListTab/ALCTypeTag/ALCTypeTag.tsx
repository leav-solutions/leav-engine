import React from 'react';
import styled from 'styled-components';

interface IALCTypeTagProps {
    color: any;
    input: string;
}

interface IInputTag {
    color: any;
}

/* tslint:disable-next-line:variable-name */
const TypeTag = styled.span<IInputTag>`
    padding: 1px 2px;
    margin: 1px 2px;
    color: ${props => (props.color[2] > 200 && props.color[1] < 170 ? '#ffffff' : '#000000')};
    background-color: ${props => 'rgb(' + props.color[0] + ',' + props.color[1] + ',' + props.color[2] + ')'};
    border-radius: 3px;
`;

function ALCTypeTag({color, input}: IALCTypeTagProps): JSX.Element {
    // console.log(color)
    return <TypeTag color={color}>{input}</TypeTag>;
}

export default ALCTypeTag;
