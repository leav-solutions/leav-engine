// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import EditRecordModal from './EditRecordModal';

jest.mock(
    '../EditRecord/EditRecord',
    () =>
        function EditRecordComp() {
            return <div>Edit record</div>;
        }
);

describe('EditRecordModal', () => {
    const onClose = jest.fn();
    test('Open and close modal', async () => {
        const comp = mount(<EditRecordModal open library="test_lib" onClose={onClose} />);

        expect(comp.find('Modal').prop('open')).toBe(true);

        act(() => {
            comp.find('Button.close-button').simulate('click');
        });

        await wait(0);

        expect(onClose).toBeCalled();
    });
});
