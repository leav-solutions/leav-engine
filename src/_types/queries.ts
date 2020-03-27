export type FullTreeContent = Record[];

export interface Record {
    order: number;
    record: RecordAttr;
    children: FullTreeContent;
}

export interface RecordAttr {
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
        small: PreviewStatus;
        medium: PreviewStatus;
        big: PreviewStatus;
        pages: PreviewStatus;
    };
    previews: Previews;
    root_key: string;
    library: string;
    trt?: boolean;
}

export interface Previews {
    small: string;
    medium: string;
    big: string;
    pages: string;
}

export interface PreviewStatus {
    status: number;
    message: string;
}
