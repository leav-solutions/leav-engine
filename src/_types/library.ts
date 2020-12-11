// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttribute} from './attribute';
import {ITreePermissionsConf} from './permissions';
import {IRecordIdentityConf} from './record';
import {ISystemTranslation} from './systemTranslation';

export interface ILibrary {
    id: string;
    label?: ISystemTranslation;
    system?: boolean;
    behavior?: LibraryBehavior;

    /**
     * List of attributes usable in this library
     */
    attributes?: IAttribute[];

    /**
     * Records permissions settings for this library
     */
    permissions_conf?: ITreePermissionsConf;

    /**
     * Records identity settings for this library
     */
    recordIdentityConf?: IRecordIdentityConf;

    /**
     * List of indexed attributes
     */
    fullTextAttributes?: IAttribute[];
}

export interface ILibraryFilterOptions {
    id?: string;
    label?: string;
    system?: boolean;
}

export enum LibraryBehavior {
    STANDARD = 'standard',
    FILES = 'files'
}

export const USERS_LIBRARY = 'users';
export const USERS_GROUPS_LIBRARY = 'users_groups';
