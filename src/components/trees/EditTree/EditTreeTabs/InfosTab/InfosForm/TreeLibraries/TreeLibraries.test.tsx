// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {TreeLibraryInput} from '../../../../../../../_gqlTypes/globalTypes';
import TreeLibraries from './TreeLibraries';

describe('TreeLibraries', () => {
    const mockTreeLibraries: TreeLibraryInput[] = [
        {
            library: 'test_lib',
            settings: {
                allowMultiplePositions: true
            }
        },
        {
            library: 'test_lib2',
            settings: {
                allowMultiplePositions: false
            }
        }
    ];

    const onChange = jest.fn();

    test('Render libraries', async () => {
        const comp = shallow(<TreeLibraries libraries={mockTreeLibraries} onChange={onChange} readonly={false} />);

        expect(comp.find('[data-test-id="lib-selector"]')).toHaveLength(2);
        expect(comp.find('[data-test-id="add-button"]')).toHaveLength(1);
        expect(comp.find('[data-test-id="delete-button"]')).toHaveLength(2);
        expect(comp.find('[data-test-id="settings-allowMultiplePositions-test_lib"]').prop('checked')).toBe(true);
        expect(comp.find('[data-test-id="settings-allowMultiplePositions-test_lib2"]').prop('checked')).toBe(false);
    });

    test('Render libraries on readonly mode', async () => {
        const comp = shallow(<TreeLibraries libraries={mockTreeLibraries} onChange={onChange} readonly />);

        expect(comp.find('[data-test-id="settings-allowMultiplePositions-test_lib"]').prop('disabled')).toBe(true);
        expect(comp.find('[data-test-id="add-button"]')).toHaveLength(0);
        expect(comp.find('[data-test-id="delete-button"]')).toHaveLength(0);
    });
});
