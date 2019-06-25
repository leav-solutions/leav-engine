import {ITreeElement} from './tree';

export interface IValue {
    id_value?: number;
    attribute?: string;
    value?: any;
    raw_value?: any;
    created_at?: number;
    modified_at?: number;
    version?: {
        [treeName: string]: ITreeElement;
    };
}
