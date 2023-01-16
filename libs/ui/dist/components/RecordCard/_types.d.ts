import {CSSObject} from 'styled-components';
import {PreviewSize} from '../../constants';
import {IRecordIdentityWhoAmI} from '../../_types/RecordIdentity';
export interface IRecordCardProps {
    record: IRecordIdentityWhoAmI;
    size: PreviewSize;
    style?: CSSObject;
    previewStyle?: CSSObject;
    lang?: string[];
    withPreview?: boolean;
    withLibrary?: boolean;
    tile?: boolean;
    simplistic?: boolean;
}
