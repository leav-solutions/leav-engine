// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {IRecord} from './record';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export type IPreview = {
    [x: string]: string;
} & {
    file?: IRecord;
};
