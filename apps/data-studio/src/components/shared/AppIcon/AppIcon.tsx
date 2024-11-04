// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017

type PossibleSizes = 'tiny' | 'small' | 'medium' | 'big' | 'huge';

interface IAppIconProps {
    size: PossibleSizes;
    style?: React.CSSProperties;
}

function AppIcon({style, size}: IAppIconProps): JSX.Element {
    const heightBySize: {[key in PossibleSizes]: number} = {
        tiny: 64,
        small: 128,
        medium: 256,
        big: 512,
        huge: 1024
    };

    return <img src={`/global-icon/${size}`} height={`${heightBySize[size]}px`} style={style} alt="" />;
}

export default AppIcon;
