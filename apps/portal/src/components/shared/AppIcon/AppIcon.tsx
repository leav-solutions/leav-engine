import {GLOBAL_BASE_URL} from '../../../constants';
import {type CSSProperties} from 'react';

type PossibleSizes = 'tiny' | 'small' | 'medium' | 'big' | 'huge';

interface IAppIconProps {
    size: PossibleSizes;
    style?: CSSProperties;
}

function AppIcon({style, size}: IAppIconProps): JSX.Element {
    const heightBySize: {[key in PossibleSizes]: number} = {
        tiny: 64,
        small: 128,
        medium: 256,
        big: 512,
        huge: 1024,
    };

    return (
        <img src={`${GLOBAL_BASE_URL}/global-icon/${size}`} style={style} height={`${heightBySize[size]}px`} alt="" />
    );
}

export default AppIcon;
