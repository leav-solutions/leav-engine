// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IFormFrameSettings} from '@leav/utils';
import {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {IFormElementProps} from '../../_types';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';

const Wrapper = styled.iframe`
    width: 100%;
    height: ${props => props.height || '100%'};
    min-height: ${props => props.height || '500px'};
    border: none;
`;

function Frame({element, onValueSubmit, onDeleteMultipleValues}: IFormElementProps<IFormFrameSettings>): JSX.Element {
    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();
    const iFrameRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    useEffect(() => {
        const iframe = iFrameRef.current;
        if (iframe) {
            const handleLoad = () => {
                setIframeLoaded(true);
            };

            iframe.addEventListener('load', handleLoad);

            return () => {
                iframe.removeEventListener('load', handleLoad);
            };
        }
    }, [iFrameRef]);

    useEffect(() => {
        const handler = event => {
            switch (event.data.type) {
                case 'submitValue':
                    onValueSubmit(event.data.values, event.data.version);
                    break;
                case 'deleteValue':
                    onDeleteMultipleValues(event.data.attribute, event.data.values, event.data.version);
                    break;
                default:
                    //console.log('unknown message type');
                    break;
            }
        };
        window.addEventListener('message', handler);

        // clean up
        return () => window.removeEventListener('message', handler);
    }, []);

    useEffect(() => {
        const iframe = iFrameRef.current;
        if (iframe && iframeLoaded) {
            iframe.contentWindow?.postMessage(
                {
                    currentRecord: record
                },
                element.settings.url
            );
        }
    }, [record, iframeLoaded]);

    return <Wrapper ref={iFrameRef} height={element.settings.height} src={element.settings.url}></Wrapper>;
}

export default Frame;
