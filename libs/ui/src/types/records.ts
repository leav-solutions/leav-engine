// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPreviewScalar} from '@leav/utils';
import {SystemTranslation} from './scalars';

export interface IRecordIdentityLibrary {
    id: string;
    label?: SystemTranslation | null;
}

export interface IRecordIdentityPreview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
}

export interface IRecordIdentityWhoAmI {
    id: string;
    label?: string | null;
    subLabel?: string | null;
    color?: string | null;
    library: IRecordIdentityLibrary;
    preview?: IPreviewScalar | null;
}

export interface IRecordIdentity {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}
