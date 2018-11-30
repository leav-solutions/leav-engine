import * as React from 'react';
import {Image} from 'semantic-ui-react';
import {getInvertColor, getRandomColor} from 'src/utils/utils';

interface IRecordPreviewProps {
    label: string;
    color: string | null;
    image: string | null;
    style?: React.CSSProperties;
}

function RecordPreview({label, color, image, style}: IRecordPreviewProps): JSX.Element {
    if (image) {
        return <Image src={image} avatar style={style} />;
    }

    const initial = label[0].toLocaleUpperCase();

    const bgColor = color || getRandomColor();
    const fontColor = getInvertColor(bgColor);

    const forcedStyle: React.CSSProperties = {
        backgroundColor: bgColor,
        color: fontColor,
        fontSize: '1.1em',
        height: '2em',
        width: '2em',
        padding: '5px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: '50%'
    };

    return (
        <div className="initial" style={{...style, ...forcedStyle}}>
            {initial}
        </div>
    );
}

export default RecordPreview;
