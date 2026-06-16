import {type FilesAttributes} from '../_constants/systemAttributes';
import {type IEmbeddedAttribute} from './attribute';

export enum FileEvents {
    CREATE = 'CREATE',
    REMOVE = 'REMOVE',
    UPDATE = 'UPDATE',
    MOVE = 'MOVE',
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

export type IFileMetadata = {
    [key in FilesAttributes]?: string | number | boolean;
};
