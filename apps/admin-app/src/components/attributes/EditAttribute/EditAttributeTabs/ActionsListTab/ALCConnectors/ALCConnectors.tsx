// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import {IColorDic} from '../interfaces/interfaces';

interface IALCConnectorsProps {
    inputs: Array<string | null>;
    dictionnary: IColorDic;
    isDragging?: boolean;
}

interface IConnectorContainer {
    isDragging: boolean;
}

interface IConnector {
    iColor: number[];
}

const ConnectorsContainer = styled.div<IConnectorContainer>`
    width: 100%;
    display: flex;
    flex-direction: row;
    border-radius: 3px;
    overflow: hidden;
    height: 5px;
`;

const Connector = styled.div<IConnector>`
    color: ${props => (props.iColor[2] > 200 && props.iColor[1] < 170 ? '#ffffff' : '#000000')};
    background-color: ${props => 'rgb(' + props.iColor[0] + ',' + props.iColor[1] + ',' + props.iColor[2] + ')'};
    flex-grow: 1;
    text-align: center;
`;

function ALCConnectors({inputs, dictionnary, isDragging}: IALCConnectorsProps): JSX.Element {
    const allInputs = Object.keys(dictionnary);

    const renderInput = (input: string, i: number) => {
        if (inputs) {
            const color = inputs.includes(input) ? dictionnary[input] : [205, 205, 205];
            return <Connector key={i} iColor={color} title={input} />;
        }
        return undefined;
    };

    return (
        <ConnectorsContainer isDragging={!!isDragging}>
            {allInputs && allInputs.map((input, i) => renderInput(input, i))}
        </ConnectorsContainer>
    );
}

export default ALCConnectors;
