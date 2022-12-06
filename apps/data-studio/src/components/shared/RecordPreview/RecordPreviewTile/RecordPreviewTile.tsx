// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ImageLoading from 'components/shared/ImageLoading';
import {useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {getInitials, getInvertColor, stringToColor} from 'utils';
import {IGeneratedPreviewProps, IRecordPreviewProps} from '../_types';

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
            {getInitials(label)}
        </GeneratedPreviewTile>
    );
}

export default RecordPreviewTile;
