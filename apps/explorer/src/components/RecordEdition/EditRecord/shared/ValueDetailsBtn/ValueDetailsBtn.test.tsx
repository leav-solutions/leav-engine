// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {IRecordPropertyStandard} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute_StandardAttribute} from '_gqlTypes/GET_FORM';
import {render, screen} from '_tests/testUtils';
import {mockAttributeStandard} from '__mocks__/common/attribute';
import ValueDetailsBtn from './ValueDetailsBtn';

jest.mock('../../shared/ValueDetails', () => {
    return function ValueDetails() {
        return <div>ValueDetails</div>;
    };
});

describe('ValueDetailsBtn', () => {
    const mockValue: IRecordPropertyStandard = {
        value: 'my value',
        raw_value: 'my raw value',
        created_at: null,
        created_by: null,
        modified_at: null,
        modified_by: null,
        id_value: null
    };

    const mockAttribute: GET_FORM_forms_list_elements_elements_attribute_StandardAttribute = {
        ...mockAttributeStandard,
        label: {
            fr: 'my attribute label'
        },
        system: false
    };

    test('Open value details on click', async () => {
        render(<ValueDetailsBtn value={mockValue} attribute={mockAttribute} />);

        const valueDetailsBtn = screen.getByRole('button', {name: /info/});
        expect(screen.queryByText('ValueDetails')).not.toBeInTheDocument();

        expect(valueDetailsBtn).toBeInTheDocument();
        userEvent.click(valueDetailsBtn);

        expect(screen.queryByText('ValueDetails')).toBeInTheDocument();
    });
});
