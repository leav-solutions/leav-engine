import {type CSSObject} from 'styled-components';
import {type PreviewSize} from '../../constants';

export interface IEntityPreviewProps {
    label: string;
    color?: string;
    image?: string;
    style?: React.CSSProperties & CSSObject;
    imageStyle?: React.CSSProperties & CSSObject;
    placeholderStyle?: React.CSSProperties & CSSObject;
    tile?: boolean;
    size?: PreviewSize;
    simplistic?: boolean;
}

export interface IGeneratedPreviewProps {
    $bgColor: string;
    $fontColor: string;
    $size?: PreviewSize;
    style?: React.CSSProperties & CSSObject;
    $simplistic?: boolean;
}
