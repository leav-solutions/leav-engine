// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFileDataElement} from 'graphQL/queries/records/getFileDataQuery';
import {ReactNode} from 'react';

export interface IFileViewerProps {
    fileData: IFileDataElement;
    fallback: ReactNode;
}
