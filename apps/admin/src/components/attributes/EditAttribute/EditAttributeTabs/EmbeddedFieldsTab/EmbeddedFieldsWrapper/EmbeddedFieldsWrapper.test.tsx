// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import EmbeddedFieldsDisplay from '../EmbeddedFieldsDisplay';
import EmbeddedFieldsForm from '../EmbeddedFieldsForm';
import EmbeddedFieldsWrapper from './EmbeddedFieldsWrapper';

describe('EmbeddedFieldsWrapper', () => {
    const handleSave = jest.fn();
    test('should return something', () => {
        const mockAttributes = {
            id: 'test',
            label: {
                fr: 'testFr',
                en: 'testEn'
            },
            format: 'text'
        };

        const mockValues = [];

        const mockSetValues = jest.fn();

        const comp = mount(
            <EmbeddedFieldsWrapper
                attribute={mockAttributes}
                displayForm
                formValues={mockValues}
                setFormValues={mockSetValues}
                save={handleSave}
            />
        );

        expect(comp.find('div')).toBeTruthy();
    });

    test('should return EmbeddedFieldsForm', () => {
        const mockAttributes = {
            id: 'test',
            label: {
                fr: 'testFr',
                en: 'testEn'
            },
            format: 'testFormat'
        };

        const mockValues = [];

        const mockSetValues = jest.fn();

        const comp = mount(
            <EmbeddedFieldsWrapper
                attribute={mockAttributes}
                displayForm
                formValues={mockValues}
                setFormValues={mockSetValues}
                save={handleSave}
            />
        );

        expect(comp.find(EmbeddedFieldsForm)).toHaveLength(1);
    });

    test('should return EmbeddedFieldsDisplay', () => {
        const mockAttributes = {
            id: 'test',
            label: {
                fr: 'testFr',
                en: 'testEn'
            },
            format: 'text'
        };

        const mockValues = [];

        const mockSetValues = jest.fn();

        const comp = mount(
            <EmbeddedFieldsWrapper
                attribute={mockAttributes}
                displayForm={false}
                formValues={mockValues}
                setFormValues={mockSetValues}
                save={handleSave}
            />
        );

        expect(comp.find(EmbeddedFieldsDisplay)).toHaveLength(1);
    });
});
