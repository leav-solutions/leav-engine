import { SystemTranslation } from './SystemTranslation';
export interface IRecordIdentityLibrary {
    id: string;
    label: SystemTranslation | null;
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
    label: string | null;
    color: string | null;
    library: IRecordIdentityLibrary;
    preview: IRecordIdentityPreview | null;
}
export interface IRecordIdentity {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}
