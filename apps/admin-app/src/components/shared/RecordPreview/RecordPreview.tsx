// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Image} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getInvertColor, stringToColor} from '../../../utils/utils';

interface IRecordPreviewProps {
    label: string;
    color: string | null;
    image: string | null;
    style?: CSSObject;
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

function RecordPreview({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return (
            <ImagePreview>
                <Image src={image} style={{...style, height: '1rem'}} />
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

export default React.memo(RecordPreview);
