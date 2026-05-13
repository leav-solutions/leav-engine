import {type IRecord} from '../../_types/record';

export const mockRecord: IRecord = {
    id: '123456',
    library: 'my_lib',
    created_at: 1234567890,
    created_by: '1',
    modified_at: 1234567890,
    modified_by: '1',
    active: true,
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
    file_path: 'path',
};
