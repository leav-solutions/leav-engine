// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';

// @ts-ignore
import IconSvg from '../svg/svgEllipsis.svg';

const CustomImg = styled.img`
    transform: translate(0px, -1px);
`;

export const IconEllipsisHorizontal = () => {
    return (
        <div>
            <CustomImg src={IconSvg} alt="icon ellipsis" />
        </div>
    );
};
