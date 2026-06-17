import {type IRecord} from './record';

export type IPreview = {
    [x: string]: string;
} & {
    file?: IRecord;
};
