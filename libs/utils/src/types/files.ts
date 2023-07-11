// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export enum FileType {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    OTHER = 'other'
}

export type FileRecord<T extends {}> = T & {
    type: FileType;
};

export interface IPreviewScalar<T extends {}> {
    pdf?: string;
    file: FileRecord<T>;
    original: string;
}
