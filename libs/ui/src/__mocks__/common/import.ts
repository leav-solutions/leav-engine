import {type ISheet} from '_ui/components/ImportModal/_types';
import {ImportMode, ImportType} from '_ui/_gqlTypes';
import {mockAttributeWithDetails} from './attribute';

export const mockSheet: ISheet = {
    type: ImportType.STANDARD,
    library: 'test_lib',
    columns: ['colA', 'colB'],
    mode: ImportMode.upsert,
    keyColumnIndex: 0,
    mapping: ['colA', 'colB'],
    data: [
        {
            colA: '1',
            colB: '2',
        },
        {
            colA: '21',
            colB: '22',
        },
    ],
    name: 'test_sheet',
    attributes: [
        {...mockAttributeWithDetails, id: 'colA'},
        {...mockAttributeWithDetails, id: 'colB'},
    ],
};
