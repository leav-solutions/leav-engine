import React from 'react';
import styled from 'styled-components';
import ConnectorRect from '../ALCCard/ConnectorRect';
import {IColorDic} from '../interfaces/interfaces';

interface IALCInputConnectorProps {
    size: number;
    types: string[];
    colorTypeDictionnary: IColorDic;
    connColor: number[];
    forList?: boolean;
}

interface ITopTriangle {
    connColor: number[];
}

interface ITopConnector {
    forList?: boolean;
}

const TopTriangle = styled.div<ITopTriangle>`
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 20px 0 0 20px;
    border-color: transparent transparent transparent
        ${props =>
            props.connColor
                ? `rgb(${props.connColor[0]}, ${props.connColor[1]}, ${props.connColor[2]})`
                : 'transparent'};
`;

const TopConnector = styled.div<ITopConnector>`
    position: absolute;
    top: ${props => (props.forList ? 'auto' : '-20px')};
    height: ${props => (props.forList ? 'auto' : '20px')};
    bottom: ${props => (props.forList ? '83px' : 'auto')};
    height: ${props => (props.forList ? '20px' : 'auto')};
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
`;

function ALCInputConnector({
    size,
    types,
    colorTypeDictionnary,
    connColor,
    forList
}: IALCInputConnectorProps): JSX.Element {
    const width = size ? size : 50;

    return (
        <TopConnector forList={forList}>
            <ConnectorRect size={width ? width : 50} types={types} colorTypeDictionnary={colorTypeDictionnary} />
            {connColor && <TopTriangle connColor={connColor} />}
        </TopConnector>
    );
}

export default ALCInputConnector;
