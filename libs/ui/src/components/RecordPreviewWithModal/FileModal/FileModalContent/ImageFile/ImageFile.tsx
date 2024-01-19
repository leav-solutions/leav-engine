// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Image} from 'antd';
import {icons as defaultPreviewIcons} from 'antd/lib/image/PreviewGroup';
import {useState} from 'react';
import styled from 'styled-components';
import {themeVars} from '../../../../../antdTheme';
import {ImageLoading} from '../../../../ImageLoading';
import {IFileViewerProps} from '../_types';

const PreviewImage = styled(Image)<{$loaded: boolean}>`
    display: ${p => (p.$loaded ? 'block' : 'none')};
`;
function ImageFile({fileData, fallback, showTransparency = false}: IFileViewerProps): JSX.Element {
    const imagePreviews = fileData?.whoAmI?.preview;
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    if (!imagePreviews?.huge || hasFailed) {
        return fallback as JSX.Element;
    }

    const _handleLoad = () => {
        setImageLoaded(true);
    };

    return (
        <>
            {!imageLoaded && <ImageLoading style={{height: '50%', width: '50%'}} />}
            <PreviewImage
                $loaded={imageLoaded}
                src={imagePreviews.huge as string}
                onLoad={_handleLoad}
                onError={() => {
                    setImageLoaded(true);
                    setHasFailed(true);
                }}
                style={{background: showTransparency ? themeVars.checkerBoard : themeVars.imageDefaultBackground}} // To show transparency
                preview={{
                    icons: {
                        ...defaultPreviewIcons,
                        rotateLeft: false,
                        rotateRight: false
                    }
                }}
            />
        </>
    );
}

export default ImageFile;
