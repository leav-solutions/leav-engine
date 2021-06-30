// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes} from '@leav/utils';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {
    mockFormElementContainer,
    mockFormElementInput,
    mockFormElementTabs,
    mockFormElementTextBlock
} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import Container from './Container';

jest.mock('../../hooks/useFormElementsByContainerContext', () => ({
    useFormElementsByContainerContext: () => ({
        container: [mockFormElementContainer, mockFormElementInput, mockFormElementTabs, mockFormElementTextBlock]
    })
}));

describe('Container', () => {
    test('Render children', async () => {
        render(<Container record={mockRecordWhoAmI} element={mockFormElementContainer} recordValues={{}} />);

        const children = await screen.findAllByTestId('container-child-element');
        expect(children.length).toBe(4);
        expect(screen.getByText(FormUIElementTypes.FIELDS_CONTAINER)).toBeInTheDocument();
        expect(screen.getByText(FormFieldTypes.TEXT_INPUT)).toBeInTheDocument();
        expect(screen.getByText(FormUIElementTypes.TABS)).toBeInTheDocument();
        expect(screen.getByText(FormUIElementTypes.TEXT_BLOCK)).toBeInTheDocument();
    });
});
