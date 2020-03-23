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
    ancestors: ITreeValuesListAncestors[] | null;
}

export interface IValuesListConf {
    enable: boolean;
    allowFreeEntry?: boolean | null;
    values?: string[] | ILinkValuesList[] | ITreeValuesList[] | null;
}

export type ValuesList = string[] | ILinkValuesList[] | ITreeValuesList[];
