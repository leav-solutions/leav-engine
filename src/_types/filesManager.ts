export enum FileEvents {
    CREATE = 'CREATE',
    REMOVE = 'REMOVE',
    UPDATE = 'UPDATE',
    MOVE = 'MOVE'
}

export enum FilesAttributes {
    ROOT_KEY = 'root_key',
    IS_DIRECTORY = 'is_directory',
    FILE_PATH = 'file_path',
    FILE_NAME = 'file_name',
    INODE = 'inode',
    PREVIEWS = 'previews',
    PREVIEWS_STATUS = 'previews_status',
    ACTIVE = 'active'
}

export interface IFilesAttributes {
    ROOT_KEY?: string;
    IS_DIRECTORY?: boolean;
    FILE_PATH?: string;
    FILE_NAME?: string;
    INODE?: number;
    PREVIEWS_STATUS?: object;
    PREVIEWS?: object;
    ACTIVE?: boolean;
}

export interface IFileEventData {
    event: FileEvents;
    time: number;
    pathBefore: string | null;
    pathAfter: string | null;
    inode: number;
    rootKey: string;
    isDirectory: boolean;
}

export interface IPreviewVersionSize {
    size: number;
    name: string;
    output?: string;
}

export interface IPreviewVersion {
    background: boolean | string;
    density: number;
    multiPage?: string;
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
    recordId: number;
}

export interface IPreviewResponse {
    context: IPreviewResponseContext;
    input: string;
    results?: IPreviewResponseResult[];
}
