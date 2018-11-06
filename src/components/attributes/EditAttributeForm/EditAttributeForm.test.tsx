import {i18n} from 'i18next';
import * as React from 'react';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import {Mockify} from 'src/_types/Mockify';
import EditAttributeForm from './EditAttributeForm';

describe('EditAttributeForm', () => {
    test('Snapshot test', async () => {
        const mockI18n: Mockify<i18n> = {
            language: 'fr',
            options: {
                fallbackLng: ['en']
            }
        };

        const attribute: GET_ATTRIBUTES_attributes = {
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null}
        };

        const onSubmit = jest.fn();

        const comp = create(<EditAttributeForm attribute={attribute} onSubmit={onSubmit} i18n={mockI18n as i18n} />);

        expect(comp).toMatchSnapshot();
    });
});
