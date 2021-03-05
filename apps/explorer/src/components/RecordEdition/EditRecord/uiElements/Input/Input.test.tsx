// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockFormElementInput} from '__mocks__/common/form';
import Input from './Input';

describe('Input', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<Input element={mockFormElementInput} />);
        });

        expect(comp);
    });
});
