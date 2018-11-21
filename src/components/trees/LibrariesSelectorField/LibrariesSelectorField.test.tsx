import {shallow} from 'enzyme';
import * as React from 'react';
import LibrariesSelectorField from './LibrariesSelectorField';

jest.mock('src/utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

describe('LibrariesSelectorField', () => {
    test('Snapshot test', async () => {
        const libraries = [
            {
                id: 'lib1',
                label: {fr: 'Lib'}
            },
            {
                id: 'lib2',
                label: {fr: 'Lib'}
            }
        ];

        const comp = shallow(<LibrariesSelectorField libraries={libraries} />);

        expect(comp.find('FormDropdown').prop('options')).toHaveLength(2);
    });
});
