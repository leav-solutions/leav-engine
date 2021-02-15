// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {IItem} from '../../../../../_types/types';
import FormPreviewsModal from './FormPreviewsModal';

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }))
    });
});

describe('FormPreviewModal', () => {
    const mockValues: IItem = {
        whoAmI: {id: 'id', library: {id: 'libId', label: {fr: 'libLabelFr', en: 'libLabelEn'}}},
        fields: {},
        index: 0
    };

    test('should render FormPreviewModal for each previews', async () => {
        const comp = mount(<FormPreviewsModal values={mockValues} updateValues={jest.fn()} />);

        expect(comp.find('FormPreviewModal')).toHaveLength(4);
    });
});
