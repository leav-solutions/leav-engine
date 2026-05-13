import {type ReactNode} from 'react';
import {type IFileDataWithPreviewsStatus} from '../../../../_queries/records/getFileDataQuery';

export interface IFileViewerProps {
    fileData: IFileDataWithPreviewsStatus;
    fallback: ReactNode;
    showTransparency?: boolean;
}
