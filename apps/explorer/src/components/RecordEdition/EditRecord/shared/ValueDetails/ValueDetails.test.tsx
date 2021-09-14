// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordPropertyStandard} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute_StandardAttribute} from '_gqlTypes/GET_FORM';
import {act, render, screen} from '_tests/testUtils';
import {mockAttributeStandard} from '__mocks__/common/attribute';
import {mockModifier} from '__mocks__/common/value';
import ValueDetails from './ValueDetails';

describe('ValueDetails', () => {
    const mockValueSimple: IRecordPropertyStandard = {
        value: 'my value',
        raw_value: 'my raw value',
        created_at: null,
        created_by: null,
        modified_at: null,
        modified_by: null,
        id_value: null
    };

    const mockValue: IRecordPropertyStandard = {
        ...mockValueSimple,
        created_at: 123456789,
        modified_at: 123456789,
        created_by: mockModifier,
        modified_by: mockModifier,
        id_value: '123456'
    };

    const mockAttribute: GET_FORM_forms_list_elements_elements_attribute_StandardAttribute = {
        ...mockAttributeStandard,
        label: {
            fr: 'my attribute label'
        },
        system: false,
        values_list: {enable: false, allowFreeEntry: false, values: []}
    };

    test('Display infos about attribute and value', async () => {
        await act(async () => {
            render(<ValueDetails value={mockValue} attribute={mockAttribute} />);
        });

        expect(screen.getByText(String(mockAttribute.label.fr))).toBeInTheDocument();
        expect(screen.getByText(String(mockAttribute.id))).toBeInTheDocument();
        expect(screen.queryByText(/modified_at/)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(mockValue.modified_by.whoAmI.label))).toBeInTheDocument();
    });

    test("Don't display modifier is not set in value", async () => {
        await act(async () => {
            render(<ValueDetails value={mockValueSimple} attribute={mockAttribute} />);
        });

        expect(screen.queryByText(/modified_at/)).not.toBeInTheDocument();
        expect(screen.queryByText(/modified_by/)).not.toBeInTheDocument();
    });
});
