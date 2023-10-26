// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getInitials, getInvertColor, stringToColor} from '@leav/utils';
import {Skeleton} from 'antd';
import {useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {PreviewSize} from '../../../constants';
import {getPreviewSize} from '../../../helpers/getPreviewSize';
import {IEntityPreviewProps, IGeneratedPreviewProps} from '../_types';
import SimplisticEntityPreview from './SimplisticEntityPreview';

interface IImagePreviewProps {
    size?: PreviewSize;
    style?: CSSObject;
}

const GeneratedPreview = styled.div<IGeneratedPreviewProps>`
    ${props => props.style || ''}
    background-color: ${props => props.$bgColor};
    color: ${props => props.$fontColor};
    font-size: ${({$size: size}) => `calc(${getPreviewSize(size)} / 2.6)`};
    height: ${({$size: size}) => getPreviewSize(size)};
    width: ${({$size: size}) => getPreviewSize(size)};
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 50%;
`;
GeneratedPreview.displayName = 'GeneratedPreview';

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

const Image = styled.img<{$loaded: boolean}>`
    display: ${p => (p.$loaded ? 'block' : 'none')};
`;

function EntityPreviewList({label, color, image, size, style, simplistic = false}: IEntityPreviewProps): JSX.Element {
    const [imageLoaded, setImageLoaded] = useState(false);

    if (simplistic) {
        return <SimplisticEntityPreview label={label} />;
    }

    if (image) {
        return (
            <ImagePreview size={size} style={style}>
                {!imageLoaded && (
                    <Skeleton.Image
                        style={{
                            width: '65%',
                            height: '65%',
                            background: 'none',
                            margin: 'auto'
                        }}
                    />
                )}
                <Image
                    role="img"
                    $loaded={imageLoaded}
                    src={image}
                    alt="record preview"
                    onLoad={() => setImageLoaded(true)}
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
            $bgColor={bgColor}
            $fontColor={fontColor}
            $size={size}
            style={{...style}}
        >
            {getInitials(label)}
        </GeneratedPreview>
    );
}

export default EntityPreviewList;
