import {type CSSProperties, useMemo} from 'react';
import {Image} from 'semantic-ui-react';
import styled from 'styled-components';
import {getInvertColor, stringToColor} from '../../../utils/utils';
import {getInitials} from '@leav/utils';

interface IRecordPreviewProps {
    label: string;
    color: string | null;
    image: string | null;
    style?: CSSProperties;
}

interface IGeneratedPreviewProps {
    $bgColor: string;
    $fontColor: string;
    style?: CSSProperties;
}

const previewSize = '2.5rem';

const GeneratedPreview = styled.div<IGeneratedPreviewProps>`
    background-color: ${props => props.$bgColor};
    color: ${props => props.$fontColor};
    font-size: 1.1em;
    height: ${previewSize};
    width: ${previewSize};
    padding: 5px;
    text-align: center;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    justify-content: center;
    border-radius: 50%;
`;
GeneratedPreview.displayName = 'GeneratedPreview';

const ImagePreview = styled.div`
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    height: ${previewSize};
    width: ${previewSize};
    overflow: hidden;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;
ImagePreview.displayName = 'ImagePreview';

function RecordPreview({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return (
            <ImagePreview>
                <Image
                    src={image}
                    style={{...style, flexShrink: 0, width: '2rem', height: '2rem', objectFit: 'cover'}}
                    alt=""
                />
            </ImagePreview>
        );
    }

    const initials = getInitials(label ?? '');

    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return useMemo(
        () => (
            <GeneratedPreview className="initial" $bgColor={bgColor} $fontColor={fontColor} style={style}>
                {initials}
            </GeneratedPreview>
        ),
        [initials, bgColor, fontColor, style],
    );
}

export default RecordPreview;
