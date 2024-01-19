// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import styled from 'styled-components';
import {IFileViewerProps} from '../_types';

const VideoPlayer = styled.video`
    max-height: 100%;
    max-width: 100%;
`;

function VideoFile({fileData, fallback}: IFileViewerProps): JSX.Element {
    const [hasFailed, setHasFailed] = useState(false);

    if (!fileData?.whoAmI?.preview?.original || hasFailed) {
        return fallback as JSX.Element;
    }

    return (
        <VideoPlayer
            controls
            src={fileData.whoAmI.preview.original}
            title={fileData.file_name[0].value}
            data-testid="video-player"
            onError={() => {
                setHasFailed(true);
            }}
        />
    );
}

export default VideoFile;
