// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';

interface ICustomIconProps {
    svg: string;
    label?: string;
}

const CustomImg = styled.img`
    transform: translate(0px, -1px) scale(1.5);
    width: 1em;
    height: 1em;
`;

function CustomIcon({svg, label}: ICustomIconProps): JSX.Element {
    return (
        <div>
            <CustomImg src={svg} alt={label} />
        </div>
    );
}

export default CustomIcon;
