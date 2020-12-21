// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {Header} from 'semantic-ui-react';
import EmbeddedFieldsDisplay from './EmbeddedFieldsDisplay';

describe('EmbeddedFieldsDisplay', () => {
    const mockAttribute = {
        id: 'test',
        label: {
            fr: 'testFr',
            en: 'testEn'
        },
        format: 'text'
    };

    const comp = mount(<EmbeddedFieldsDisplay attribute={mockAttribute} />);

    test('should return something', () => {
        expect(comp.find('div')).toBeTruthy();
    });

    test('should display id in input disabled', () => {
        expect(comp.find(Header).prop('children')).toBe(mockAttribute.id);
    });
});
