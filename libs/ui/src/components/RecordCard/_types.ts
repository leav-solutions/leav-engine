// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
