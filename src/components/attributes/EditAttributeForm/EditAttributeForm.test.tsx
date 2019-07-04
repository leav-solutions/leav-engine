import {shallow} from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import EditAttributeForm from './EditAttributeForm';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(['fr', 'fr'])
}));

describe('EditAttributeForm', () => {
    const attribute: GET_ATTRIBUTES_attributes = {
        ...mockAttrSimple
    };
    const onSubmit = jest.fn();
    const onPermsSettingsSubmit = jest.fn();

    test('Render form for existing attribute', async () => {
        const comp = shallow(
            <EditAttributeForm
                attribute={attribute}
                onSubmit={onSubmit}
                onPermsSettingsSubmit={onPermsSettingsSubmit}
                readOnly={false}
            />
        );

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Mon Attribut');
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new attribute', async () => {
        const comp = shallow(
            <EditAttributeForm
                attribute={null}
                onSubmit={onSubmit}
                onPermsSettingsSubmit={onPermsSettingsSubmit}
                readOnly={false}
            />
        );

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('attributes.new');
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(false);
    });

    test.only('Autofill ID with label on new attribute', async () => {
        const comp = renderer.create(
            <EditAttributeForm
                attribute={null}
                onSubmit={onSubmit}
                onPermsSettingsSubmit={onPermsSettingsSubmit}
                readOnly={false}
            />
        );

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
        const comp = shallow(
            <EditAttributeForm
                attribute={attribute}
                onSubmit={onSubmit}
                onPermsSettingsSubmit={onPermsSettingsSubmit}
                readOnly={false}
            />
        );
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
