import { CSSObject } from 'styled-components';
import { PreviewSize } from '../../constants';
export interface IRecordPreviewProps {
    label: string;
    color?: string;
    image?: string;
    style?: CSSObject;
    tile?: boolean;
    size?: PreviewSize;
    simplistic?: boolean;
}
export interface IGeneratedPreviewProps {
    bgColor: string;
    fontColor: string;
    size?: PreviewSize;
    style?: CSSObject;
    simplistic?: boolean;
}
