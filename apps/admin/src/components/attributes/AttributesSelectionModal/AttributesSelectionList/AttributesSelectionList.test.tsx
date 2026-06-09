import React from 'react';
import {render, screen} from '../../../../_tests/testUtils';
import {type GET_ATTRIBUTES_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES';
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
                    en: 'Test',
                },
            },
        ];

        const toggleSelection = vi.fn();

        render(<AttributesSelectionList attributes={attributes} selection={[]} toggleSelection={toggleSelection} />);

        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('test_attr')).toBeInTheDocument();
    });
});
