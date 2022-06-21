// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {getInvertColor, stringToColor} from '../../../utils/utils';
import {PreviewSize} from '../../../_types/types';
import ImageLoading from '../ImageLoading';

export interface IRecordPreviewProps {
    label: string;
    color?: string;
    image?: string;
    style?: CSSObject;
    tile?: boolean;
    size?: PreviewSize;
}

export const _getPreviewSize = (size?: PreviewSize) => {
    switch (size) {
        case PreviewSize.medium:
            return '4.5rem';
        case PreviewSize.big:
            return '7rem';
        case PreviewSize.small:
        default:
            return '3rem';
    }
};

interface IGeneratedPreviewProps {
    bgColor: string;
    fontColor: string;
    size?: PreviewSize;
    style?: CSSObject;
}

const GeneratedPreview = styled.div<IGeneratedPreviewProps>`
    ${props => props.style || ''}
    background-color: ${props => props.bgColor};
    color: ${props => props.fontColor};
    font-size: ${({size}) => `calc(${_getPreviewSize(size)} / 2.5)`};
    height: ${({size}) => _getPreviewSize(size)};
    width: ${({size}) => _getPreviewSize(size)};
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 50%;
`;
GeneratedPreview.displayName = 'GeneratedPreview';

interface IImagePreviewProps {
    size?: PreviewSize;
    style?: CSSObject;
}

const ImagePreview = styled.div<IImagePreviewProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${({size}) => _getPreviewSize(size)};
    width: ${({size}) => _getPreviewSize(size)};
    overflow: hidden;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;
ImagePreview.displayName = 'ImagePreview';

const _getInitials = (label: string) => {
    if (typeof label !== 'string') {
        return '?';
    }

    const words = label.split(' ').slice(0, 2);
    const letters = words.length > 1 ? words.map(word => word[0]).join('') : words[0].slice(0, 2);

    return letters.toUpperCase();
};

const GeneratedPreviewTile = styled.div<IGeneratedPreviewProps>`
    ${props => props.style || ''}
    background-color: ${props => props.bgColor};
    color: ${props => props.fontColor};
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

    img {
        object-fit: cover;
    }
`;
ImagePreviewWrapper.displayName = 'ImagePreviewTile';

const Image = styled.img<{$loaded: boolean}>`
    display: ${p => (p.$loaded ? 'block' : 'none')};
`;

function RecordPreviewTile({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    const [imageLoaded, setImageLoaded] = useState(false);

    if (image) {
        return (
            <ImagePreviewWrapper style={{position: 'relative', ...style}}>
                {!imageLoaded && <ImageLoading />}
                <Image
                    $loaded={imageLoaded}
                    src={image}
                    alt="record preview"
                    style={{...style}}
                    onLoad={() => setImageLoaded(true)}
                />
            </ImagePreviewWrapper>
        );
    }

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return (
        <GeneratedPreviewTile
            data-testid="generated-preview"
            className="initial"
            bgColor={bgColor}
            fontColor={fontColor}
            style={style}
        >
            {_getInitials(label)}
        </GeneratedPreviewTile>
    );
}

function RecordPreviewList({label, color, image, size, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return (
            <ImagePreview size={size} style={style}>
                <img
                    src={image}
                    alt="record preview"
                    style={{
                        maxHeight: 'auto',
                        maxWidth: 'auto',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        ...style
                    }}
                />
            </ImagePreview>
        );
    }

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return (
        <GeneratedPreview
            data-testid="generated-preview"
            className="initial"
            bgColor={bgColor}
            fontColor={fontColor}
            size={size}
            style={{...style}}
        >
            {_getInitials(label)}
        </GeneratedPreview>
    );
}

function RecordPreviewWrapper({label, color, image, style, tile, size}: IRecordPreviewProps): JSX.Element {
    if (tile) {
        return RecordPreviewTile({label, color, image, size, style});
    }
    return RecordPreviewList({label, color, image, size, style});
}

export default React.memo(RecordPreviewWrapper);
