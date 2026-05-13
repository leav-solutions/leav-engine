import React from 'react';
import {type IFormElementProps} from '../../../_types';

interface IUiIframeSettings {
    url: string;
    height?: string;
}

function UiIframe({settings}: IFormElementProps<IUiIframeSettings>): JSX.Element {
    //return settings?.url ? <div>{settings?.url}</div> : <div />;
    return (
        <ul>
            <li>Url: {settings?.url}</li>
            <li>Height: {settings?.height}</li>
        </ul>
    );
}

export default UiIframe;
