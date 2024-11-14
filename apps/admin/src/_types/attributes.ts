// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity_whoAmI} from '../_gqlTypes/RecordIdentity';

export interface ILinkValuesList {
    whoAmI: RecordIdentity_whoAmI;
}

export interface ITreeValuesListAncestors {
    record: {
        whoAmI: RecordIdentity_whoAmI;
    };
}

export interface ITreeValuesList {
    id: string;
    record: {
        whoAmI: RecordIdentity_whoAmI;
    };
    ancestors: ITreeValuesListAncestors[] | null;
}

export interface IValuesListConf {
    enable: boolean;
    allowFreeEntry?: boolean | null;
    allowListUpdate?: boolean | null;
    values?: ValuesList | null;
}

export type StandardValuesListType = Array<string | IDateRangeValue>;
export type ValuesList = StandardValuesListType | ILinkValuesList[] | ITreeValuesList[];

export interface IDateRangeValue {
    from: string;
    to: string;
}
