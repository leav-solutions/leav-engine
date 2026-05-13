import {useState} from 'react';
import {type IFileViewerProps} from '../_types';

function AudioFile({fileData, fallback}: IFileViewerProps): JSX.Element {
    const [hasFailed, setHasFailed] = useState(false);

    if (!fileData?.whoAmI?.preview?.original || hasFailed) {
        return fallback as JSX.Element;
    }

    return (
        <audio
            controls
            src={fileData.whoAmI.preview.original}
            title={fileData.file_name[0].value}
            data-testid="audio-player"
            onError={() => {
                setHasFailed(true);
            }}
        />
    );
}

export default AudioFile;
