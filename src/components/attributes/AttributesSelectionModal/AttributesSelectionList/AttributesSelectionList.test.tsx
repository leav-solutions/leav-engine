import React from 'react';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES';
import {mockAttrSimple} from '../../../../__mocks__/attributes';
import AttributesSelectionList from './AttributesSelectionList';

describe('AttributesSelectionList', () => {
    test('Snapshot test', async () => {
        const attributes: GET_ATTRIBUTES_attributes_list[] = [
            {
                ...mockAttrSimple,
                id: 'test_attr',
                label: {
                    fr: 'Test',
                    en: 'Test'
                }
            }
        ];

        const toggleSelection = jest.fn();

        const comp = create(
            <AttributesSelectionList attributes={attributes} selection={[]} toggleSelection={toggleSelection} />
        );

        expect(comp).toMatchSnapshot();
    });
});
