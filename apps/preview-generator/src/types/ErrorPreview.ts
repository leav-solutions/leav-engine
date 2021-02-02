// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorList} from './ErrorList';

export interface IErrorPreviewParams {
    output?: string;
    name?: string;
    size?: number;
    background?: boolean | string;
    density?: number;
    errorId?: string;
}

export interface IErrorPreviewMessage {
    error: number;
    params?: IErrorPreviewParams;
}

export class ErrorPreview extends Error {
    public error: ErrorList;
    public params: IErrorPreviewParams;

    public constructor(err: IErrorPreviewMessage) {
        super();

        this.error = err.error;
        this.params = err.params;
    }
}
