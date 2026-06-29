import styled from 'styled-components';

// @ts-expect-error svg module has no type declaration
import IconSvg from '../svg/svgEllipsis.svg';

const CustomImg = styled.img`
    transform: translate(0px, -1px) rotate(90deg);
`;

export const IconEllipsisVertical = () => (
    <div>
        <CustomImg src={IconSvg} alt="icon ellipsis vertical" />
    </div>
);
