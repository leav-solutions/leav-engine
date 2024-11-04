// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {APPS_ENDPOINT, APP_ENDPOINT} from '../../../constants';
import React from 'react';

interface ILEAVEngineIconProps {
    height: string;
    style?: React.CSSProperties;
}

function LEAVEngineIcon({height, style}: ILEAVEngineIconProps): JSX.Element {
    return (
        <img
            src={`/${APPS_ENDPOINT}/${APP_ENDPOINT}/assets/logo-leavengine.svg`}
            alt="LEAV Engine"
            height={height}
            className="icon"
            style={style}
        />
    );
}

export default LEAVEngineIcon;
