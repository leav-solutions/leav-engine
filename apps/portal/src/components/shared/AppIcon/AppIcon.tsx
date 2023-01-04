// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview} from '_gqlTypes/GET_GLOBAL_SETTINGS';

type PossibleSizes = keyof Omit<GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview, 'pdf' | 'file' | 'original'>;

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

    return <img src={`/global-icon/${size}`} style={style} height={`${heightBySize[size]}px`} />;
}

export default AppIcon;
