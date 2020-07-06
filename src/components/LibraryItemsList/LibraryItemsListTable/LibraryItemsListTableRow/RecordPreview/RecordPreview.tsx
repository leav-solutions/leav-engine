import React from 'react';
import {Image} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getInvertColor, stringToColor} from '../../../../../utils/utils';
import {PreviewSize} from '../../../../../_types/types';

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
            return '2rem';
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

function RecordPreviewWrapper({label, color, image, style, tile, size}: IRecordPreviewProps): JSX.Element {
    if (tile) {
        return RecordPreviewTile({label, color, image, size, style});
    }
    return RecordPreviewList({label, color, image, size, style});
}

function RecordPreviewList({label, color, image, size, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return (
            <ImagePreview size={size}>
                <Image
                    src={image}
                    style={{
                        ...style,
                        maxHeight: `calc(${getPreviewSize(size)} - 0.5rem)`,
                        maxWidth: `calc(${getPreviewSize(size)} - 0.5rem)`
                    }}
                />
            </ImagePreview>
        );
    }

    const initial = label[0].toLocaleUpperCase();

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return (
        <GeneratedPreview
            className="initial"
            bgColor={bgColor}
            fontColor={fontColor}
            size={size}
            style={{...style, fontSize: `calc(${getPreviewSize(size)} - 1rem)`}}
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
`;
GeneratedPreviewTile.displayName = 'GeneratedPreviewTile';

const ImagePreviewTile = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10rem;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;
ImagePreviewTile.displayName = 'ImagePreviewTile';

function RecordPreviewTile({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return (
            <ImagePreviewTile>
                <Image src={image} wrapped ui={false} style={{...style}} />;
            </ImagePreviewTile>
        );
    }

    const initial = label[0].toLocaleUpperCase();

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return (
        <GeneratedPreviewTile className="initial" bgColor={bgColor} fontColor={fontColor} style={style}>
            {initial}
        </GeneratedPreviewTile>
    );
}

export default React.memo(RecordPreviewWrapper);
