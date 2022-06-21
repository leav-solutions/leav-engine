// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExpandOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import React, {useRef} from 'react';
import styled from 'styled-components';
import {IFileViewerProps} from '../_types';

const FullscreenBtn = styled(Button)`
    && {
        position: absolute;
        right: 0.5rem;
        bottom: 0.5rem;
    }
`;

function DocumentFile({fileData, fallback}: IFileViewerProps): JSX.Element {
    const viewerRef = useRef<HTMLIFrameElement>();

    if (!fileData?.whoAmI?.preview?.original) {
        return fallback as JSX.Element;
    }

    const _handleFullScreen = (): void => {
        viewerRef.current.requestFullscreen();
    };

    return (
        <>
            <FullscreenBtn onClick={_handleFullScreen} icon={<ExpandOutlined />} shape="circle" />
            <iframe
                data-testid="document-viewer"
                ref={viewerRef}
                src={`${fileData.whoAmI.preview.original}#toolbar=0`}
                width="100%"
                height="100%"
                allowFullScreen
            />
        </>
    );
}

export default DocumentFile;
