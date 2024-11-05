// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import {IColorDic} from '../../interfaces/interfaces';

interface IConnectorRectProps {
    size: number;
    types: string[];
    colorTypeDictionnary: IColorDic;
}

const Rectangle = styled.div`
    width: 100%;
    height: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    cursor: pointer;
    justify-content: center;
`;

function ConnectorRect({size, types, colorTypeDictionnary}: IConnectorRectProps): JSX.Element {
    //  no size => flexbox
    return (
        <Rectangle style={{width: `${size / 2 - 10}px`}}>
            {types.length > 0 &&
                colorTypeDictionnary[types[0]] &&
                types.map((type, i) => {
                    const bgColor = colorTypeDictionnary[type];
                    const color = bgColor[2] > 200 && bgColor[1] < 170 ? '#ffffff' : '#000000';
                    return (
                        <Rectangle
                            key={i}
                            style={{
                                background: `${
                                    bgColor ? `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})` : 'rgb(255, 255, 255)'
                                }`,
                                color
                            }}
                            title={type}
                        >
                            {type[0].toUpperCase()}
                        </Rectangle>
                    );
                })}
        </Rectangle>
    );
}

export default ConnectorRect;
