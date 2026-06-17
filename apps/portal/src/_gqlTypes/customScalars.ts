import {IPreviewScalar} from '@leav/utils';

export {};

declare global {
    export type SystemTranslation = Record<string, string | null>;
    export type Any = any;
    export type Preview = IPreviewScalar;
}
