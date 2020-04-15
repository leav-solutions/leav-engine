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
