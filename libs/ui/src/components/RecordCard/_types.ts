// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CSSObject} from 'styled-components';
import {PreviewSize} from '../../constants';
import {IRecordIdentityWhoAmI} from '../../types/records';

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
