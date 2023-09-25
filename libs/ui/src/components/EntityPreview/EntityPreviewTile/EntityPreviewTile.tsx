// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getInitials, getInvertColor, stringToColor} from '@leav/utils';
import {useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {themeVars} from '../../../antdTheme';
import {ImageLoading} from '../../ImageLoading';
import {ImageMissing} from '../../ImageMissing';
import {IEntityPreviewProps, IGeneratedPreviewProps} from '../_types';

interface IImagePreviewTileProps {
    style?: CSSObject;
}

const ImagePreviewWrapper = styled.div<IImagePreviewTileProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 0.25rem 0.25rem 0 0;
    width: fit-content;
    height: fit-content;
    margin: auto;
    background: ${themeVars.imageDefaultBackground};

    && img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
    }
`;
ImagePreviewWrapper.displayName = 'ImagePreviewTile';

const ImageComp = styled.img<{$loaded: boolean}>`
    display: ${p => (p.$loaded ? 'block' : 'none')};
    border: 1px solid ${themeVars.borderColor};
`;

const GeneratedPreviewTile = styled.div<IGeneratedPreviewProps>`
    ${props => props.style || ''}
    background-color: ${props => props.$bgColor};
    color: ${props => props.$fontColor};
    font-size: 4em;
    padding: 5px;
    height: 10rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 0.25rem 0.25rem 0 0;
`;
GeneratedPreviewTile.displayName = 'GeneratedPreviewTile';

function RecordPreviewTile({
    label,
    color,
    image,
    style,
    imageStyle,
    placeholderStyle
}: IEntityPreviewProps): JSX.Element {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    if (image) {
        return (
            <ImagePreviewWrapper style={{position: 'relative', ...style}}>
                {!imageLoaded && <ImageLoading />}
                {!hasFailed ? (
                    <ImageComp
                        $loaded={imageLoaded}
                        src={image}
                        alt="record preview"
                        style={{...imageStyle}}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageLoaded(true);
                            setHasFailed(true);
                        }}
                    />
                ) : (
                    <ImageMissing style={{...style}} />
                )}
            </ImagePreviewWrapper>
        );
    }

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return (
        <GeneratedPreviewTile
            data-testid="generated-preview"
            className="initial"
            $bgColor={bgColor}
            $fontColor={fontColor}
            style={placeholderStyle}
        >
            {getInitials(label)}
        </GeneratedPreviewTile>
    );
}

export default RecordPreviewTile;
