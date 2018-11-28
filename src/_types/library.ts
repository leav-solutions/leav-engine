import {IAttribute} from './attribute';
import {ITreePermissionsConf} from './permissions';
import {IRecordIdentityConf} from './record';
import {ISystemTranslation} from './systemTranslation';

export interface ILibrary {
    id: string;
    label?: ISystemTranslation;
    system?: boolean;

    /**
     * List of attributes usable in this library
     */
    attributes?: IAttribute[];

    /**
     * Records permissions settings for this library
     */
    permissionsConf?: ITreePermissionsConf;

    /**
     * Records identity settings for this library
     */
    recordIdentityConf?: IRecordIdentityConf;
}

export interface ILibraryFilterOptions {
    id?: string;
    label?: string;
    system?: boolean;
}
