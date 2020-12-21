// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {TFunction} from 'i18next';
import React from 'react';
import {Modal} from 'semantic-ui-react';
import ModalCreateEmbeddedField from './ModalCreateEmbeddedField';

describe('ModalCreateNewEmbeddedField', () => {
    const mockAttribute = {
        id: 'test',
        label: {
            fr: 'test fr',
            en: 'test en'
        },
        format: 'text',
        validation_regex: ''
    };

    const mockAdd = jest.fn();
    const mockT: TFunction = () => undefined;

    const comp = mount(<ModalCreateEmbeddedField attrId={mockAttribute.id} add={mockAdd} t={mockT} />);

    test('should return something', () => {
        expect(comp.find(Modal)).toBeTruthy();
    });
});
