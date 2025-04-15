// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
