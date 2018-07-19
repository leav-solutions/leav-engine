import {IAttribute} from './attribute';
import {ITreePermissionsConf} from './permissions';
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
}

export interface ILibraryFilterOptions {
    id?: string;
}
