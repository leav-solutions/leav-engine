import {render} from 'enzyme';
import React from 'react';
import {ILibrary} from '../../../_types/types';
import LibraryCard from './LibraryCard';

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn
}));

describe('LibraryCard', () => {
    test('Snapshot test', async () => {
        const lib = {
            label: {}
        };
        const comp = render(<LibraryCard lib={lib as ILibrary} changeLibSelected={jest.fn} />);

        expect(comp).toMatchSnapshot();
    });
});
