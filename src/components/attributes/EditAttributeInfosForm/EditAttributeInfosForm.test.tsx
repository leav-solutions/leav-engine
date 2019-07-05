import {shallow} from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
import EditAttributeInfosForm from './EditAttributeInfosForm';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(['fr', 'fr'])
}));

describe('EditAttributeInfosForm', () => {
    const attribute: GET_ATTRIBUTES_attributes = {
        ...mockAttrSimple,
        label: {fr: 'Test 1', en: null}
    };
    const onSubmit = jest.fn();

    test('Render form for existing attribute', async () => {
        const comp = shallow(
            <MockedLangContextProvider>
                <EditAttributeInfosForm attribute={attribute} onSubmit={onSubmit} readOnly={false} />
            </MockedLangContextProvider>
        );

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test 1');
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new attribute', async () => {
        const comp = shallow(
            <MockedLangContextProvider>
                <EditAttributeInfosForm attribute={null} onSubmit={onSubmit} readOnly={false} />
            </MockedLangContextProvider>
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
            <MockedLangContextProvider>
                <EditAttributeInfosForm attribute={null} onSubmit={onSubmit} readOnly={false} />
            </MockedLangContextProvider>
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
            <MockedLangContextProvider>
                <EditAttributeInfosForm attribute={attribute} onSubmit={onSubmit} readOnly={false} />
            </MockedLangContextProvider>
        );
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
