// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {IEmbeddedAttribute} from './attribute';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export enum FileEvents {
    CREATE = 'CREATE',
    REMOVE = 'REMOVE',
    UPDATE = 'UPDATE',
    MOVE = 'MOVE'
}

export enum FilesAttributes {
    ROOT_KEY = 'root_key',
    FILE_PATH = 'file_path',
    FILE_NAME = 'file_name',
    INODE = 'inode',
    ACTIVE = 'active',
    HASH = 'hash'
}

export const PREVIEWS_ATTRIBUTE_SUFFIX = 'previews';
export const PREVIEWS_STATUS_ATTRIBUTE_SUFFIX = 'previews_status';

export interface IFilesAttributes {
    ROOT_KEY?: string;
    FILE_PATH?: string;
    FILE_NAME?: string;
    INODE?: number;
    PREVIEWS_STATUS?: object;
    PREVIEWS?: object;
    ACTIVE?: boolean;
    HASH?: string;
}

export interface IFileEventData {
    event: FileEvents;
    time: number;
    pathBefore: string | null;
    pathAfter: string | null;
    inode: number;
    rootKey: string;
    isDirectory: boolean;
    hash?: string;
    recordId?: string;
}

export interface IPreviewVersionSize {
    size: number;
    name: string;
    output?: string;
}

export interface IPreviewVersion {
    background: boolean | string;
    density: number;
    pdf?: string;
    sizes: IPreviewVersionSize[];
}

export interface IPreviewMessage {
    input: string;
    context: any;
    versions: IPreviewVersion[];
}

export interface IPreviewsStatus {
    [sizeName: string]: {
        status: number;
        message: string;
    };
}

export interface IPreviews {
    [sizeName: string]: string;
}

export interface IPreviewResponseResult {
    error: number;
    error_detail: string;
    params?: {
        background?: true | false | string;
        density?: number;
        size: number;
        output: string;
        name: string;
    };
}

export interface IPreviewResponseContext {
    library: string;
    recordId: string;
}

export interface IPreviewResponse {
    context: IPreviewResponseContext;
    input: string;
    results?: IPreviewResponseResult[];
}

export interface IPreviewAttributesSettings {
    [attributeId: string]: IEmbeddedAttribute[];
}
