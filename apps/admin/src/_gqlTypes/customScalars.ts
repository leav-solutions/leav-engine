// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IKeyValue} from '../_types/shared';

declare global {
    export type SystemTranslation = IKeyValue<string | null>;
    export type JSONObject = Record<string, any>;
    export type Any = any;
    export type ValueMetadata = IKeyValue<unknown>;
    export type ValueVersion = IKeyValue<{
        id: string;
        library: string;
    }>;
    export enum TaskPriority {
        LOW = 0,
        MEDIUM = 1,
        HIGH = 2
    }
}
