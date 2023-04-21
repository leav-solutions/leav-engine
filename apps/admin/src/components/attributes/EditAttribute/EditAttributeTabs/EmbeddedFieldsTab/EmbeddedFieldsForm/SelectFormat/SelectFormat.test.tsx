// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {TFunction} from 'i18next';
import React from 'react';
import {Select} from 'semantic-ui-react';
import {Mockify} from '../../../../../../../_types/Mockify';
import {IFormValue} from '../../EmbeddedFieldsTab';
import SelectFormat from './SelectFormat';

describe('SelectFormat', () => {
    const mockT: Mockify<TFunction> = jest.fn();

    const mockFormValues = {
        originalId: 'test',
        id: 'test',
        label: {
            fr: 'test fr',
            en: 'test en'
        },
        format: 'text',
        validation_regex: ''
    };

    const comp = mount(
        <SelectFormat
            formValues={mockFormValues as IFormValue}
            hasChild={false}
            onChange={jest.fn()}
            t={mockT as TFunction}
            save={jest.fn()}
        />
    );

    test('should return something', () => {
        expect(comp.find(Select)).toBeTruthy();
    });
});
