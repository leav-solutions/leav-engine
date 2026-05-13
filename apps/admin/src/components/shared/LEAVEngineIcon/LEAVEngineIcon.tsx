import {APP_BASE_URL} from '../../../constants';
import React from 'react';

interface ILEAVEngineIconProps {
    height: string;
    style?: React.CSSProperties;
}

function LEAVEngineIcon({height, style}: ILEAVEngineIconProps): JSX.Element {
    return (
        <img
            src={`${APP_BASE_URL}/assets/logo-leavengine.svg`}
            alt="LEAV Engine"
            height={height}
            className="icon"
            style={style}
        />
    );
}

export default LEAVEngineIcon;
