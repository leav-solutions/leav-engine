// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';

interface ILEAVEngineIconProps {
    height: string;
    style?: React.CSSProperties;
}

function LEAVEngineIcon({height, style}: ILEAVEngineIconProps): JSX.Element {
    return (
        <img
            src={`/${process.env.REACT_APP_ENDPOINT}/assets/logo-leavengine.svg`}
            alt="LEAV Engine"
            height={height}
            className="icon"
            style={style}
        />
    );
}

export default LEAVEngineIcon;
