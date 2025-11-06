// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAttribute} from './attribute';
import {type IPreviewVersion} from './filesManager';
import {type ITreePermissionsConf} from './permissions';
import {type IRecordIdentityConf} from './record';
import {type ISystemTranslation} from './systemTranslation';
import {type IKeyValue} from './shared';

export interface ILibrary extends ICoreEntity {
    system?: boolean;
    behavior?: LibraryBehavior;

    mandatoryAttribute?: string;

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

    /**
     * ID of default view
     */
    defaultView?: string;

    icon?: {
        libraryId: string;
        recordId: string;
    };

    previewsSettings?: ILibraryPreviewsSettings[];

    settings?: IKeyValue<any>;
}

/**
 * Library as stored in the DB, without embedded attributes
 */
export interface ILibraryDbEvent extends Omit<ILibrary, 'attributes' | 'fullTextAttributes'> {
    attributes?: string[];
    fullTextAttributes?: string[];
}

export interface ILibraryFilterOptions extends ICoreEntityFilterOptions {
    system?: boolean;
}

export interface ILibraryPreviewsSettings {
    label: ISystemTranslation;
    description?: ISystemTranslation;
    system: boolean;
    versions: IPreviewVersion;
}

export enum LibraryBehavior {
    STANDARD = 'standard',
    DIRECTORIES = 'directories',
    FILES = 'files',
    JOIN = 'join',
}

export const USERS_LIBRARY = 'users';
export const USERS_GROUPS_LIBRARY = 'users_groups';
