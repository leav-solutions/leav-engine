// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {TFunction} from 'i18next';
import React from 'react';
import {Mockify} from '../../../../../../../_types/Mockify';
import {IFormValues} from '../EmbeddedFieldsForm';
import LabelFields from './LabelFields';

describe('LabelFields', () => {
    const mockT: Mockify<TFunction> = jest.fn();
    const handleSave = jest.fn();

    const mockFormValues: IFormValues = {
        id: 'test',
        originalId: 'test',
        label: {
            fr: 'test fr',
            en: 'test en'
        },
        format: 'text',
        validation_regex: ''
    };

    const comp = mount(
        <LabelFields
            formValues={mockFormValues}
            setFormValues={jest.fn}
            onChange={jest.fn}
            t={mockT as TFunction}
            save={handleSave}
        />
    );

    test('should return something', () => {
        expect(comp.find('div')).toBeTruthy();
    });

    test('should create an input for fr label', () => {
        expect(comp.find('input[name="label-fr"]').prop('value')).toBe(mockFormValues?.label?.fr);
    });

    test('should create an input for en label', () => {
        expect(comp.find('input[name="label-en"]').prop('value')).toBe(mockFormValues?.label?.en);
    });
});
