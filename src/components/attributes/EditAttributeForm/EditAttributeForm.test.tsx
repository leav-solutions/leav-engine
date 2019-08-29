import {shallow} from 'enzyme';
import React from 'react';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
import EditAttributeForm from './EditAttributeForm';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(['fr', 'fr'])
}));

describe('EditAttributeForm', () => {
    const attribute: GET_ATTRIBUTES_attributes_list = {
        ...mockAttrSimple
    };
    const onSubmit = jest.fn();
    const onPermsSettingsSubmit = jest.fn();
    const onCheckIdExists = jest.fn().mockReturnValue(false);

    test('Render form for existing attribute', async () => {
        const comp = shallow(
            <MockedLangContextProvider>
                <EditAttributeForm
                    attribute={attribute}
                    onSubmit={onSubmit}
                    onPermsSettingsSubmit={onPermsSettingsSubmit}
                    readOnly={false}
                    onCheckIdExists={onCheckIdExists}
                />
            </MockedLangContextProvider>
        );

        expect(
            comp
                .find('EditAttributeForm')
                .shallow()
                .find('Header')
                .shallow()
                .text()
        ).toBe('Mon Attribut');
    });

    test('Render form for new attribute', async () => {
        const comp = shallow(
            <MockedLangContextProvider>
                <EditAttributeForm
                    attribute={null}
                    onSubmit={onSubmit}
                    onPermsSettingsSubmit={onPermsSettingsSubmit}
                    readOnly={false}
                    onCheckIdExists={onCheckIdExists}
                />
            </MockedLangContextProvider>
        );

        expect(
            comp
                .find('EditAttributeForm')
                .shallow()
                .find('Header')
                .shallow()
                .text()
        ).toBe('attributes.new');
    });
});
