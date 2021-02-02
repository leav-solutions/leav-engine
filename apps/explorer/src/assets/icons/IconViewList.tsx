// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import IconSvg from '../svg/svgViewList.svg';

const CustomImg = styled.img`
    transform: translate(0px, -1px);
`;

export const IconViewList = () => {
    return (
        <div>
            <CustomImg src={IconSvg} alt="Icon view list" />
        </div>
    );
};
