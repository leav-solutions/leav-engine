import React from 'react';
import {Image} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getInvertColor, stringToColor} from '../../../../../utils/utils';

interface IRecordPreviewProps {
    label: string;
    color?: string;
    image?: string;
    style?: CSSObject;
    tile?: boolean;
}

interface IGeneratedPreviewProps {
    bgColor: string;
    fontColor: string;
    style?: CSSObject;
}

const GeneratedPreview = styled.div<IGeneratedPreviewProps>`
    ${props => props.style || ''}
    background-color: ${props => props.bgColor};
    color: ${props => props.fontColor};
    font-size: 1.1em;
    height: 2em;
    width: 2em;
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 50%;
`;
GeneratedPreview.displayName = 'GeneratedPreview';

const ImagePreview = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 2rem;
    width: 2rem;
    overflow: hidden;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;
ImagePreview.displayName = 'ImagePreview';

function RecordPreviewWrapper({label, color, image, style, tile}: IRecordPreviewProps): JSX.Element {
    if (tile) {
        return RecordPreviewTile({label, color, image, style});
    }
    return RecordPreviewList({label, color, image, style});
}

function RecordPreviewList({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return (
            <ImagePreview>
                <Image src={image} style={{...style, maxHeight: '1.5rem', maxWidth: '1.5rem'}} />
            </ImagePreview>
        );
    }

    const initial = label[0].toLocaleUpperCase();

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return (
        <GeneratedPreview className="initial" bgColor={bgColor} fontColor={fontColor} style={style}>
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
