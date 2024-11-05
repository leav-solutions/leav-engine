// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {IEmbeddedFields} from '../../../../../../_types/embeddedFields';
import {Mockify} from '../../../../../../_types/Mockify';
import EmbeddedFieldsForm from './EmbeddedFieldsForm';
import LabelFields from './LabelFields';
import SelectFormat from './SelectFormat';

describe('EmbeddedFieldsForm', () => {
    describe('basic attribute', () => {
        const mockAttribute: Mockify<IEmbeddedFields> = {
            id: 'test',
            label: {
                fr: 'test fr',
                en: 'test en'
            },
            format: 'text'
        };

        const mockValues = [];

        const comp = mount(
            <EmbeddedFieldsForm
                attribute={mockAttribute as IEmbeddedFields}
                formValues={mockValues}
                setFormValues={jest.fn}
                save={jest.fn()}
            />
        );

        test('should return something', () => {
            expect(comp.find('div').exists()).toBeTruthy();
        });

        test('should display id in input', () => {
            expect(comp.find('input[name="id"]').prop('value')).toBe(mockAttribute.id);
        });

        test('should use LabelFields comp for label', () => {
            expect(comp.find(LabelFields)).toHaveLength(1);
        });

        test('should display select for format ', () => {
            expect(comp.find(SelectFormat).exists()).toBeTruthy();
        });

        test('should display validation_regex input if format text', () => {
            expect(comp.find('input[name="validation_regex"]')).toHaveLength(1);
        });
    });

    describe('specific attribute', () => {
        const mockAttribute: Mockify<IEmbeddedFields> = {
            id: 'test',
            label: {
                fr: 'test fr',
                en: 'test en'
            },
            format: 'extended',
            validation_regex: 'test',
            embedded_fields: [
                {
                    id: 'testChild',
                    label: {
                        fr: 'testChild fr',
                        en: 'testChild en'
                    },
                    format: 'text',
                    validation_regex: 'testChild'
                }
            ]
        };

        const mockValues = [];

        const comp = mount(
            <EmbeddedFieldsForm
                attribute={mockAttribute as IEmbeddedFields}
                formValues={mockValues}
                setFormValues={jest.fn}
                save={jest.fn()}
            />
        );

        test("shouldn't display validation_regex input", () => {
            expect(comp.find('input[name="validation_regex"]')).toHaveLength(0);
        });
    });
});
