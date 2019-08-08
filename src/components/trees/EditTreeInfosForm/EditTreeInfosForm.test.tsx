import {MockedProvider} from '@apollo/react-testing';
import {shallow} from 'enzyme';
import React from 'react';
import {act, create} from 'react-test-renderer';
import EditTreeInfosForm from './EditTreeInfosForm';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));
jest.mock('../../../hooks/useLang', () => jest.fn().mockReturnValue(['fr']));

describe('EditTreeInfosForm', () => {
    const mockTree = {
        id: 'test',
        label: {fr: 'Test'},
        system: false,
        libraries: ['test_lib']
    };
    const onSubmit = jest.fn();

    test('Render form for existing tree', async () => {
        const comp = shallow(<EditTreeInfosForm tree={mockTree} onSubmit={onSubmit} readOnly={false} />);
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new tree', async () => {
        const comp = shallow(<EditTreeInfosForm tree={null} onSubmit={onSubmit} readOnly={false} />);
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(false);
    });

    test('Autofill ID with label on new lib', async () => {
        let comp;
        await act(async () => {
            comp = create(
                <MockedProvider>
                    <EditTreeInfosForm onSubmit={onSubmit} tree={null} readOnly={false} />
                </MockedProvider>
            );
        });

        act(() => {
            comp.root.findByProps({name: 'label/fr'}).props.onChange(null, {
                type: 'text',
                name: 'label/fr',
                value: 'labelfr'
            });
        });

        expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
    });

    test('Call submit function on submit', async () => {
        const comp = shallow(<EditTreeInfosForm onSubmit={onSubmit} tree={mockTree} readOnly={false} />);
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
