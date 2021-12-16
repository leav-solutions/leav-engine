// Copyright LEAV Solutions 2017
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
    record: {
        whoAmI: RecordIdentity_whoAmI;
    };
    ancestors: ITreeValuesListAncestors[][] | null;
}

export interface IValuesListConf {
    enable: boolean;
    allowFreeEntry?: boolean | null;
    values?: ValuesList | null;
}

export type StandardValuesListType = Array<string | IDateRangeValue>;
export type ValuesList = StandardValuesListType | ILinkValuesList[] | ITreeValuesList[];

export interface IDateRangeValue {
    from: string;
    to: string;
}
