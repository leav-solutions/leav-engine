import {type CSSObject} from 'styled-components';
import {type PreviewSize} from '../../constants';
import {type IRecordIdentityWhoAmI} from '../../types/records';

export interface IRecordCardProps {
    record: IRecordIdentityWhoAmI;
    size: PreviewSize;
    style?: React.CSSProperties & CSSObject;
    previewStyle?: React.CSSProperties & CSSObject;
    lang?: string[];
    withPreview?: boolean;
    withLibrary?: boolean;
    withColor?: boolean;
    tile?: boolean;
    simplistic?: boolean;
}
