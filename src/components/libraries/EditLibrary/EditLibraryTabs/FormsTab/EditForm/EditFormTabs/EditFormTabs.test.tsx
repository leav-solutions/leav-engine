// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockFormFull} from '../../../../../../../__mocks__/forms';
import EditFormTabs from './EditFormTabs';

jest.mock('../../../../../../../hooks/useLang');

describe('EditFormTabs', () => {
    const mockForm = {...mockFormFull};

    test('Display form edition for existing form', async () => {
        const comp = shallow(<EditFormTabs library="test_lib" form={mockForm} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test Form');

        // Check number of panes
        const panes = comp.find('Tab').prop('panes');
        expect(Array.isArray(panes)).toBe(true);
        expect((panes as any[]).length).toBeGreaterThan(1);
    });

    test('Display form edition for new form', async () => {
        const comp = shallow(<EditFormTabs library="test_lib" form={null} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('forms.new');

        // Check number of panes
        const panes = comp.find('Tab').prop('panes');
        expect(Array.isArray(panes)).toBe(true);
        expect(panes).toHaveLength(1);
    });
});
