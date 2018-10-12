import * as React from 'react';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from '../../_gqlTypes/globalTypes';
import AttributesList from './AttributesList';

describe('AttributesList', () => {
    test('Snapshot test', async () => {
        const attributes: GET_ATTRIBUTES_attributes[] = [
            {
                id: 'attr1',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test 1', en: null}
            },
            {
                id: 'attr2',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test 2', en: null}
            },
            {
                id: 'attr3',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test 3', en: null}
            }
        ];

        const onRowClick = jest.fn();

        const comp = create(<AttributesList attributes={attributes} onRowClick={onRowClick} />);

        expect(comp).toMatchSnapshot();
    });
});
