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

export type FileRecord = Record<string, any> & {
    type: FileType;
};

export interface IPreviewScalar {
    pdf?: string;
    file: FileRecord;
    original: string;
    [key: string]: string | FileRecord;
}
