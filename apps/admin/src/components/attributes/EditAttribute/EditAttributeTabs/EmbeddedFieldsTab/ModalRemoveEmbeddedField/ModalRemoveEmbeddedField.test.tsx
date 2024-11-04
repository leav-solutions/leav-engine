// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {TFunction} from 'i18next';
import React from 'react';
import {Modal} from 'semantic-ui-react';
import ModalRemoveEmbeddedField from './ModalRemoveEmbeddedField';

describe('ModalRemoveEmbeddedField', () => {
    const mockRemove = jest.fn();
    const mockT: TFunction = () => undefined;

    const comp = mount(<ModalRemoveEmbeddedField remove={mockRemove} t={mockT} />);

    test('should return something', () => {
        expect(comp.find(Modal)).toBeTruthy();
    });
});
