// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IDbLibrariesSettings {
    filesLibraryId: string;
    directoriesLibraryId: string;
}

export interface IDbScanResult extends IDbLibrariesSettings {
    treeContent: FullTreeContent;
}

export type FullTreeContent = IRecord[];

export interface IRecord {
    order: number;
    record: IRecordAttr & {treePath?: string};
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
    modified_at: number;
    modified_by: number;
    previews_status: {
        small: IPreviewStatus;
        medium: IPreviewStatus;
        big: IPreviewStatus;
        pdf: IPreviewStatus;
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
    pdf: string;
}

export interface IPreviewStatus {
    status: number;
    message: string;
}

interface IFilesByInode {
    [key: number]: IRecord[];
}
interface IFilesByName {
    [key: string]: IRecord[];
}
interface IFilesByPath {
    [key: string]: IRecord[];
}
interface IFilesByHash {
    [key: string]: IRecord[];
}

export interface IDbFilesDatas {
    filesByInode: IFilesByInode;
    filesByName: IFilesByName;
    filesByPath: IFilesByPath;
    filesByHash: IFilesByHash;
}
