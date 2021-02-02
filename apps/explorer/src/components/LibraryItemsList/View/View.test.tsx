// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {ViewType} from '../../../_types/types';
import View from './View';

describe('View', () => {
    const mockView = {value: 0, text: 'My view list 1', type: ViewType.list, color: '#50F0C4'};
    test('should show view text', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<View view={mockView} />);
        });

        expect(comp.text()).toContain(mockView.text);
    });
});
