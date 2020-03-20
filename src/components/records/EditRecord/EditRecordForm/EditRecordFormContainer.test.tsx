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
