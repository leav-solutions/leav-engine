// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockLibrary} from '../../../__mocks__/libraries';
import LibrariesSelectorField from './LibrariesSelectorField';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(v => ['fr', 'fr'])
}));

jest.mock('../../../hooks/useLang');

describe('LibrariesSelectorField', () => {
    test('Snapshot test', async () => {
        const libraries = [
            {
                ...mockLibrary,
                id: 'lib1',
                label: {fr: 'Lib'}
            },
            {
                ...mockLibrary,
                id: 'lib2',
                label: {fr: 'Lib'}
            }
        ];

        const comp = shallow(<LibrariesSelectorField libraries={libraries} />);

        expect(comp.find('FormDropdown').prop('options')).toHaveLength(2);
    });
});
