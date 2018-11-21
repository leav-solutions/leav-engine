import {shallow} from 'enzyme';
import * as React from 'react';
import EditTreeInfosForm from './EditTreeInfosForm';

jest.mock('src/utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(['fr'])
}));

describe('EditTreeInfosForm', () => {
    const mockTree = {
        id: 'test',
        label: {fr: 'Test'},
        system: false,
        libraries: ['test_lib']
    };
    const onSubmit = jest.fn();

    test('Render form for existing tree', async () => {
        const comp = shallow(<EditTreeInfosForm tree={mockTree} onSubmit={onSubmit} />);
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new tree', async () => {
        const comp = shallow(<EditTreeInfosForm tree={null} onSubmit={onSubmit} />);
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(false);
    });
    test('Autofill ID with label on new lib', async () => {
        const comp = shallow(<EditTreeInfosForm onSubmit={onSubmit} tree={null} />);

        comp.find('FormInput[name="label/fr"]').simulate('change', null, {
            type: 'text',
            name: 'label/fr',
            value: 'labelfr'
        });

        expect(comp.find('FormInput[name="id"]').props().value).toBe('labelfr');
    });

    test('Call submit function on submit', async () => {
        const comp = shallow(<EditTreeInfosForm onSubmit={onSubmit} tree={mockTree} />);
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
