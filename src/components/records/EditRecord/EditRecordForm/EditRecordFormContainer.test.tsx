// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {mockLibrary} from '../../../../__mocks__/libraries';
import EditRecordFormContainer from './EditRecordFormContainer';

jest.mock(
    './EditRecordForm',
    () =>
        function EditRecordForm() {
            return <div>EditRecordForm</div>;
        }
);

describe('EditRecordFormContainer', () => {
    test('Renders EditRecordForm', async () => {
        const comp = mount(<EditRecordFormContainer library={mockLibrary} />);
        expect(comp.find('EditRecordForm')).toHaveLength(1);
    });
});
