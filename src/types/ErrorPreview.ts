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

    constructor(err: IErrorPreviewMessage) {
        super();

        this.error = err.error;
        this.params = err.params;
    }
}
