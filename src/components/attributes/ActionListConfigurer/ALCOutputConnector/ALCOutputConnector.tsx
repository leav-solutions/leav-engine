import React from 'react';
import styled from 'styled-components';

import {IColorDic} from '../interfaces/interfaces';

import ConnectorRect from '../ALCCard/ConnectorRect';

interface IALCOutputConnectorProps {
    connectionState: string | undefined;
    connColor: number[];
    size: number;
    types: string[];
    colorTypeDictionnary: IColorDic;
    forList?: boolean;
}

interface IBottomStyle {
    connectionState: string | undefined;
    forList?: boolean;
}

interface ITopTriangle {
    connColor: number[];
}

/* tslint:disable-next-line:variable-name */
const BottomConnector = styled.div<IBottomStyle>`
    height: 20px;
    position: relative;
    bottom: 0;
    right: ${props => (props.forList ? 'auto' : '0')};
    top: ${props => (props.forList ? '-5px' : '0')};
    right: ${props => (props.forList ? '0' : 'auto')};
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: ${props => (props.connectionState && props.connectionState === 'neutral' ? '20px' : '5px')};
`;

/* tslint:disable-next-line:variable-name */
const BottomTriangle = styled.div<ITopTriangle>`
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 20px 20px 0;
    border-color: transparent
        ${props =>
            props.connColor
                ? `rgb(${props.connColor[0]}, ${props.connColor[1]}, ${props.connColor[2]})`
                : 'transparent'}
        transparent transparent;
`;

function ALCOutputConnector({
    connectionState,
    connColor,
    size,
    types,
    colorTypeDictionnary,
    forList
}: IALCOutputConnectorProps): JSX.Element {
    const width = size ? size : 100;
    return (
        <BottomConnector connectionState={connectionState} forList={forList}>
            {connColor && <BottomTriangle connColor={connColor} />}
            <ConnectorRect size={width} types={types} colorTypeDictionnary={colorTypeDictionnary} />
        </BottomConnector>
    );
}

export default ALCOutputConnector;
