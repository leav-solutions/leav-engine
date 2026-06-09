import React from 'react';
import {render, screen} from '../../../../../_tests/testUtils';
import {type GET_LIB_BY_ID_libraries_list} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {type Mockify} from '../../../../../_types/Mockify';
import AttributesTab from './AttributesTab';

vi.mock('../../../../attributes/EditAttribute/EditAttributeTabs/CustomConfigTab', () => ({
    default: function CustomConfigTab() {
        return <div>CustomConfigTab</div>;
    },
}));

describe('AttributesTab', () => {
    test('Snapshot test', async () => {
        const lib: Mockify<GET_LIB_BY_ID_libraries_list> = {
            id: 'test_lib',
            system: false,
        };
        render(<AttributesTab library={lib as GET_LIB_BY_ID_libraries_list} readonly={false} />);

        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
});
