import {shallow} from 'enzyme';
import React from 'react';
import EditTreeForm from './EditTreeForm';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));
describe('EditTreeForm', () => {
    test('Render form for existing tree', async () => {
        const tree = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: false,
            libraries: ['test_lib', 'users']
        };
        const onSubmit = jest.fn();

        const comp = shallow(<EditTreeForm tree={tree} onSubmit={onSubmit} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test');
    });

    test('Render form for new tree', async () => {
        const onSubmit = jest.fn();

        const comp = shallow(<EditTreeForm tree={null} onSubmit={onSubmit} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('trees.new');
    });
});
