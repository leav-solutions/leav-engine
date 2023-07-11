export declare enum FileType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    DOCUMENT = "document",
    OTHER = "other"
}
export declare type FileRecord<T extends {}> = T & {
    type: FileType;
};
export interface IPreviewScalar<T extends {}> {
    pdf?: string;
    file: FileRecord<T>;
    original: string;
}
