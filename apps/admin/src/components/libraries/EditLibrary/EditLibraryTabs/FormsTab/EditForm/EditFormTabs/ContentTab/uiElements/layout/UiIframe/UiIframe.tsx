// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {IFormElementProps} from '../../../_types';

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
