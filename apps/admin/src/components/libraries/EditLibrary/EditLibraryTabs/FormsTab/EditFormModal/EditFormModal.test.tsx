// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import EditFormModal from './EditFormModal';

jest.mock('../EditForm', () => function EditForm() {
        return <div>EditForm</div>;
    });

describe('EditFormModal', () => {
    const onClose = jest.fn();
    test('Open modal', async () => {
        const comp = shallow(
            <EditFormModal open formId="my_form" libraryId="my_lib" onClose={onClose} readonly={false} />
        );

        expect(comp.find('Modal').prop('open')).toBe(true);
    });
});
