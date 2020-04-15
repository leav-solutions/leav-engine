import {mount} from 'enzyme';
import {TFunction} from 'i18next';
import React from 'react';
import {Mockify} from '../../../../../../../_types/Mockify';
import LabelFields from './LabelFields';

describe('LabelFields', () => {
    const mockT: Mockify<TFunction> = jest.fn();

    const mockFormValues = {
        id: 'test',
        label: {
            fr: 'test fr',
            en: 'test en'
        },
        format: 'text',
        validation_regex: ''
    };

    const comp = mount(
        <LabelFields formValues={mockFormValues} setFormValues={jest.fn} onChange={jest.fn} t={mockT as TFunction} />
    );

    test('should return something', () => {
        expect(comp.find('div')).toBeTruthy();
    });

    test('should create an input for fr label', () => {
        expect(comp.find('input[name="label-fr"]').prop('value')).toBe(mockFormValues.label.fr);
    });

    test('should create an input for en label', () => {
        expect(comp.find('input[name="label-en"]').prop('value')).toBe(mockFormValues.label.en);
    });
});
