// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CSSObject} from 'styled-components';
import {PreviewSize} from '../../constants';
import {IRecordIdentityWhoAmI} from '../../types/RecordIdentity';

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
