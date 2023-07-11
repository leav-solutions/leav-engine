// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {IPreviewScalar} from '@leav/utils';
import {RecordIdentity} from './RecordIdentity';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export {};

declare global {
    export type SystemTranslation = Record<string, string | null>;
    export type Any = any;
    export type Preview = IPreviewScalar<RecordIdentity>;
}
