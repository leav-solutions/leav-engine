// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IFormFrameSettings} from '@leav/utils';
import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';
import {IFormElementProps} from '../../_types';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';

function Frame({element}: IFormElementProps<IFormFrameSettings>): JSX.Element {
    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();

    useEffect(() => {
        const handler = event => {
            // eslint-disable-next-line
            console.log('event', event);
        };
        window.addEventListener('message', handler);

        // clean up
        return () => window.removeEventListener('message', handler);
    }, []);

    const Wrapper = styled.iframe`
        width: 100%;
        height: ${element.settings.height || '100%'};
        min-height: ${element.settings.height || '500px'};
        border: none;
    `;

    return <Wrapper src={element.settings.url}></Wrapper>;
}

export default Frame;
