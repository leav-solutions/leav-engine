import {IKeyValue} from '../_types/shared';

declare global {
    export type SystemTranslation = IKeyValue<string | null>;
    export type Any = any;
    export type ValueMetadata = IKeyValue<unknown>;
    export type ValueVersion = IKeyValue<{
        id: string;
        library: string;
    }>;
}
