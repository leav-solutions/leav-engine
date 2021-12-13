// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LoadingOutlined} from '@ant-design/icons';
import {Skeleton} from 'antd';
import React, {useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {getInvertColor, stringToColor} from '../../../utils/utils';
import {PreviewSize} from '../../../_types/types';

interface IRecordPreviewProps {
    label: string;
    color?: string;
    image?: string;
    style?: CSSObject;
    tile?: boolean;
    size?: PreviewSize;
}

const getPreviewSize = (size?: PreviewSize) => {
    switch (size) {
        case PreviewSize.medium:
            return '5rem';
        case PreviewSize.big:
            return '8rem';
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
    font-size: 1.1em;
    height: ${({size}) => getPreviewSize(size)};
    width: ${({size}) => getPreviewSize(size)};
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
    height: ${({size}) => getPreviewSize(size)};
    width: ${({size}) => getPreviewSize(size)};
    overflow: hidden;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;
ImagePreview.displayName = 'ImagePreview';

function RecordPreviewList({label, color, image, size, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        const limitSize = size
            ? {maxHeight: `calc(${getPreviewSize(size)} - 0.5rem)`, maxWidth: `calc(${getPreviewSize(size)} - 0.5rem)`}
            : {maxHeight: 'auto', maxWidth: 'auto'};

        return (
            <ImagePreview size={size} style={style}>
                <img
                    src={image}
                    alt="record preview"
                    style={{
                        ...style,
                        ...limitSize
                    }}
                />
            </ImagePreview>
        );
    }

    const initial = String(label) ? label[0].toLocaleUpperCase() : '?';

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    const containerSize = getPreviewSize(size);

    return (
        <GeneratedPreview
            data-testid="generated-preview"
            className="initial"
            bgColor={bgColor}
            fontColor={fontColor}
            size={size}
            style={{
                ...style,
                fontSize: containerSize > '4rem' ? `calc(${containerSize} - 3rem)` : `calc(${containerSize} - 1rem)`
            }}
        >
            {initial}
        </GeneratedPreview>
    );
}

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

    img {
        object-fit: contain;
    }
`;
ImagePreviewWrapper.displayName = 'ImagePreviewTile';

const Image = styled.img<{$loaded: boolean}>`
    display: ${p => (p.$loaded ? 'block' : 'none')};
`;

const CustomSkeletonImage = styled(Skeleton.Image)`
    &&& {
        height: 100%;
        width: 100%;

        .ant-skeleton-image-svg {
            width: 30%;
            height: 30%;
        }
    }
`;

const ImageSpinner = styled(LoadingOutlined)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 2em;
`;

function RecordPreviewTile({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    const [imageLoaded, setImageLoaded] = useState(false);

    if (image) {
        return (
            <ImagePreviewWrapper style={{position: 'relative', ...style}}>
                {!imageLoaded && (
                    <>
                        <CustomSkeletonImage style={{...style}} />
                        <ImageSpinner spin data-testid="image-loading" />
                    </>
                )}
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

    const initial = label ? label[0].toLocaleUpperCase() : '?';

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
            {initial}
        </GeneratedPreviewTile>
    );
}

function RecordPreviewWrapper({label, color, image, style, tile, size}: IRecordPreviewProps): JSX.Element {
    if (tile) {
        return RecordPreviewTile({label, color, image, size, style});
    }
    return RecordPreviewList({label, color, image, size, style});
}

export default React.memo(RecordPreviewWrapper);
