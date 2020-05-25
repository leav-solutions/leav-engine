import {mount} from 'enzyme';
import React from 'react';
import {Button} from 'semantic-ui-react';
import {ILibrary} from '../../../_types/types';
import LibraryCard from './LibraryCard';

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn
}));

describe('LibraryCard', () => {
    test('Card should have actions', async () => {
        const lib = {
            label: {}
        };
        const comp = mount(<LibraryCard lib={lib as ILibrary} />);

        expect(comp.find(Button.Group)).toHaveLength(1);
    });
});
