// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';

export interface ICustomIconProps {
    svg: string;
    label?: string;
    size?: string;
    style?: React.CSSProperties;
}

const CustomImg = styled.img<{size?: string}>`
    transform: translate(0px, -1px) scale(1.5);
    width: ${props => props?.size ?? '1em'};
`;

function CustomIcon({svg, label, size, style}: ICustomIconProps): JSX.Element {
    return (
        <div style={{width: size, height: size, display: 'inline-block', ...style}}>
            <CustomImg src={svg} alt={label} size={size} />
        </div>
    );
}

export default CustomIcon;
