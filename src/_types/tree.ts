import {ISystemTranslation} from './systemTranslation';

export interface ITree {
    id: string;
    libraries: string[];
    label: ISystemTranslation;
    system?: boolean;
}

export interface ITreeFilterOptions {
    id?: string;
}
