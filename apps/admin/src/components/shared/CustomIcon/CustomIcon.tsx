import {type CSSProperties} from 'react';
import styled from 'styled-components';

export interface ICustomIconProps {
    svg: string;
    label?: string;
    size?: string;
    style?: CSSProperties;
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
