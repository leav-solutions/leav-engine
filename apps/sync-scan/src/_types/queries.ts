// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export type FullTreeContent = IRecord[];

export interface IRecord {
    order: number;
    record: IRecordAttr;
    children?: FullTreeContent;
}

export interface IRecordAttr {
    id: string;
    active: boolean;
    created_at: number;
    created_by: number;
    file_name: string;
    file_path: string;
    inode: number;
    is_directory: boolean;
    modified_at: number;
    modified_by: number;
    previews_status: {
        small: IPreviewStatus;
        medium: IPreviewStatus;
        big: IPreviewStatus;
        pages: IPreviewStatus;
    };
    previews: IPreviews;
    root_key: string;
    library: string;
    hash?: string;
    trt?: boolean;
}

export interface IPreviews {
    small: string;
    medium: string;
    big: string;
    pages: string;
}

export interface IPreviewStatus {
    status: number;
    message: string;
}
