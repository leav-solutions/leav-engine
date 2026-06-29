import {APP_BASE_URL} from '../../../constants';
import {type CSSProperties} from 'react';

interface ILEAVEngineIconProps {
    height: string;
    style?: CSSProperties;
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
