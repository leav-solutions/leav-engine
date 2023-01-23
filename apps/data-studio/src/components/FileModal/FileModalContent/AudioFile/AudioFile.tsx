// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFileViewerProps} from '../_types';

function AudioFile({fileData, fallback}: IFileViewerProps): JSX.Element {
    if (!fileData?.whoAmI?.preview?.original) {
        return fallback as JSX.Element;
    }

    return (
        <audio controls src={fileData.whoAmI.preview.original} title={fileData.file_name} data-testid="audio-player" />
    );
}

export default AudioFile;
