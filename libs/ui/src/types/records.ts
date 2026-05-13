import {type IPreviewScalar} from '@leav/utils';
import {type SystemTranslation} from './scalars';

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
    parentContext?: IRecordIdentityWhoAmI[] | null;
}

export interface IRecordIdentity {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}
