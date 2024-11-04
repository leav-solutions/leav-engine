// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {AttributeFormat, AttributeType} from '../../../../../../_gqlTypes/globalTypes';
import MetadataList from './MetadataList';

jest.mock('../../../../../../hooks/useLang');

describe('MetadataList', () => {
    const mockFields = [
        {
            id: 'field1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            label: {fr: 'field1'}
        },
        {
            id: 'field2',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            label: {fr: 'field2'}
        }
    ];

    const onChange = jest.fn();

    test('Show 1 line per field', async () => {
        const comp = shallow(<MetadataList fields={mockFields} readonly={false} onChange={onChange} />);

        expect(comp.find('TableBody > TableRow')).toHaveLength(2);
    });

    test('Show add/delete buttons', async () => {
        const comp = shallow(<MetadataList fields={mockFields} readonly={false} onChange={onChange} />);

        expect(comp.find('[data-test-id="metadata-add-field-new"]').length).toBeGreaterThanOrEqual(1);
        expect(comp.find('[data-test-id="metadata-delete-button"]').length).toBeGreaterThanOrEqual(1);
    });

    test("Don't display add and delete buttons if readonly", async () => {
        const comp = shallow(<MetadataList fields={mockFields} readonly onChange={onChange} />);

        expect(comp.find('[data-test-id="metadata-add-field-new"]')).toHaveLength(0);
        expect(comp.find('[data-test-id="metadata-delete-button"]')).toHaveLength(0);
    });

    test('Calls onChange when attribute added', async () => {
        const comp = shallow(<MetadataList fields={mockFields} readonly={false} onChange={onChange} />);

        expect(comp.find('[data-test-id="metadata-add-field-new"]').length).toBeGreaterThanOrEqual(1);
        expect(comp.find('[data-test-id="metadata-delete-button"]').length).toBeGreaterThanOrEqual(1);
    });

    // test('Calls onChange when attribute removed', async () => {});

    // test('Edit attribute on click on line', async () => {});
});
