// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {IFileViewerProps} from '../_types';

function AudioFile({fileData, fallback}: IFileViewerProps): JSX.Element {
    const [hasFailed, setHasFailed] = useState(false);

    if (!fileData?.whoAmI?.preview?.original || hasFailed) {
        return fallback as JSX.Element;
    }

    return (
        <audio
            controls
            src={fileData.whoAmI.preview.original}
            title={fileData.file_name}
            data-testid="audio-player"
            onError={() => {
                setHasFailed(true);
            }}
        />
    );
}

export default AudioFile;
