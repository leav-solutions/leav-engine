export declare enum FileType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    DOCUMENT = "document",
    OTHER = "other"
}
export declare type FileRecord = Record<string, any> & {
    type: FileType;
};
export interface IPreviewScalar {
    pdf?: string;
    file: FileRecord;
    original: string;
    [key: string]: string | FileRecord;
}
