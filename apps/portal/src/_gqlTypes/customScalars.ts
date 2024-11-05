// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {IPreviewScalar} from '@leav/utils';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export {};

declare global {
    export type SystemTranslation = Record<string, string | null>;
    export type Any = any;
    export type Preview = IPreviewScalar;
}
