// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecord} from '_types/record';

export const mockRecord: IRecord = {
    id: '123456',
    library: 'my_lib',
    created_at: 1234567890,
    created_by: '1',
    modified_at: 1234567890,
    modified_by: '1',
    active: true
};

export const mockFileRecord: IRecord = {
    id: '123456',
    library: 'my_lib',
    created_at: 1234567890,
    created_by: '1',
    modified_at: 1234567890,
    modified_by: '1',
    active: true,
    file_name: 'name',
    file_path: 'path'
};
