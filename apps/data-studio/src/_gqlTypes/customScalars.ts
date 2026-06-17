export {};
import {IPreviewScalar} from '@leav/utils';

declare global {
    export type SystemTranslation = Record<string, string | null>;
    export type JSONObject = Record<string, any>;
    export type Any = any;
    export enum TaskPriority {
        LOW = 0,
        MEDIUM = 1,
        HIGH = 2
    }
    export type Upload = any;
    export type Preview = IPreviewScalar;
}
