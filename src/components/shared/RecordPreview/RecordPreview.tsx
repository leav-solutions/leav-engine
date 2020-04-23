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

function RecordPreview({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return <Image src={image} avatar style={style} />;
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
