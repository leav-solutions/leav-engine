export enum RoutingKeys {
    FILES_EVENT = 'files.event',
    FILES_PREVIEW_REQUEST = 'files.previewRequest',
    FILES_PREVIEW_RESPONSE = 'files.previewResponse',
    INDEXATION_EVENT = 'indexation.event'
}

export interface IMessageBody {
    [key: string]: any;
}

export type onMessageFunc = (msg: string) => Promise<void>;
