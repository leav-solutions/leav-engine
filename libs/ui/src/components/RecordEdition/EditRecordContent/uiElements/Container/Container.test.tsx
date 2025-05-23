// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes} from '@leav/utils';
import {render, screen} from '_ui/_tests/testUtils';
import {
    mockCommonFormElementProps,
    mockFormElementContainer,
    mockFormElementInput,
    mockFormElementTabs,
    mockFormElementTextBlock
} from '_ui/__mocks__/common/form';
import Container from './Container';

jest.mock('../../hooks/useRecordEditionContext', () => ({
    useRecordEditionContext: () => ({
        elements: {
            container: [mockFormElementContainer, mockFormElementInput, mockFormElementTabs, mockFormElementTextBlock]
        },
        readonly: false
    })
}));

describe('Container', () => {
    test('Render children', async () => {
        render(
            <Container
                {...mockCommonFormElementProps}
                element={mockFormElementContainer}
                computedValues={null}
                formIdToLoad="edition"
            />
        );

        const children = await screen.findAllByTestId('container-child-element');
        expect(children.length).toBe(4);
        expect(screen.getByText(FormUIElementTypes.FIELDS_CONTAINER)).toBeInTheDocument();
        expect(screen.getByText(FormFieldTypes.TEXT_INPUT)).toBeInTheDocument();
        expect(screen.getByText(FormUIElementTypes.TABS)).toBeInTheDocument();
        expect(screen.getByText(FormUIElementTypes.TEXT_BLOCK)).toBeInTheDocument();
    });
});
