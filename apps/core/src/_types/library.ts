// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttribute} from './attribute';
import {IPreviewVersion} from './filesManager';
import {ITreePermissionsConf} from './permissions';
import {IRecordIdentityConf} from './record';
import {ISystemTranslation} from './systemTranslation';
import {IKeyValue} from './shared';

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
    JOIN = 'join'
}

export const USERS_LIBRARY = 'users';
export const USERS_GROUPS_LIBRARY = 'users_groups';
