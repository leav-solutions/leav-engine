// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Image} from 'antd';
import {icons as defaultPreviewIcons} from 'antd/lib/image/PreviewGroup';
import React from 'react';
import {IFileViewerProps} from '../_types';

function ImageFile({fileData, fallback}: IFileViewerProps): JSX.Element {
    const imagePreviews = fileData?.whoAmI?.preview;

    if (!imagePreviews?.huge) {
        return fallback as JSX.Element;
    }

    return (
        <Image
            src={imagePreviews.huge}
            preview={{
                icons: {
                    ...defaultPreviewIcons,
                    rotateLeft: false,
                    rotateRight: false
                }
            }}
        />
    );
}

export default ImageFile;
