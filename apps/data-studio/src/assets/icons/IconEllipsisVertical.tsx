// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';

// @ts-ignore
import IconSvg from '../svg/svgEllipsis.svg';

const CustomImg = styled.img`
    transform: translate(0px, -1px) rotate(90deg);
`;

export const IconEllipsisVertical = () => (
        <div>
            <CustomImg src={IconSvg} alt="icon ellipsis vertical" />
        </div>
    );
