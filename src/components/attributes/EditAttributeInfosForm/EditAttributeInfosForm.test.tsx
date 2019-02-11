import {shallow} from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import EditAttributeInfosForm from './EditAttributeInfosForm';

jest.mock('src/utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

describe('EditAttributeInfosForm', () => {
    const attribute: GET_ATTRIBUTES_attributes = {
        id: 'attr1',
        type: AttributeType.simple,
        format: AttributeFormat.text,
        system: false,
        label: {fr: 'Test 1', en: null},
        linked_tree: null,
        permissionsConf: null
    };
    const onSubmit = jest.fn();

    test('Render form for existing attribute', async () => {
        const comp = shallow(<EditAttributeInfosForm attribute={attribute} onSubmit={onSubmit} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test 1');
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new attribute', async () => {
        const comp = shallow(<EditAttributeInfosForm attribute={null} onSubmit={onSubmit} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('attributes.new');
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(false);
    });

    test.only('Autofill ID with label on new attribute', async () => {
        const comp = renderer.create(<EditAttributeInfosForm attribute={null} onSubmit={onSubmit} />);

        renderer.act(() => {
            comp.root.findByProps({name: 'label/fr'}).props.onChange(null, {
                type: 'text',
                name: 'label/fr',
                value: 'labelfr'
            });
        });

        expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
    });

    test('Call submit function on submit', async () => {
        const comp = shallow(<EditAttributeInfosForm attribute={attribute} onSubmit={onSubmit} />);
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
