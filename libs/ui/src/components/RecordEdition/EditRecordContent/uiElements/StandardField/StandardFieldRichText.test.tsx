// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockBrowserFunctionsForTiptap, render, screen, waitFor} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import StandardField from '../StandardField';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import {mockModifier} from '_ui/__mocks__/common/value';
import {AttributeFormat, AttributeType, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {IRecordPropertyAttribute} from '_ui/_queries/records/getRecordPropertiesQuery';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {Suspense} from 'react';

const tiptapCleanup = mockBrowserFunctionsForTiptap();

afterAll(() => {
    tiptapCleanup();
});

describe('StandardField, Rich Text input', () => {
    const mockRecordValuesCommon = {
        created_at: 123456789,
        modified_at: 123456789,
        created_by: mockModifier,
        modified_by: mockModifier,
        id_value: null,
        metadata: null,
        version: null
    };

    const mockAttribute: IRecordPropertyAttribute = {
        id: 'test_attribute',
        label: {en: 'Test Attribute'},
        format: AttributeFormat.color,
        type: AttributeType.simple,
        system: false
    };

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                id_value: null,
                created_at: 1234567890,
                created_by: {
                    ...mockModifier
                },
                modified_at: 1234567890,
                modified_by: {
                    ...mockModifier
                },
                value: 'new value',
                raw_value: 'new raw value',
                version: null,
                attribute: mockAttribute as ValueDetailsValueFragment['attribute'],
                metadata: null
            }
        ]
    };

    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});
    const mockHandleMultipleValues: DeleteMultipleValuesFunc = jest
        .fn()
        .mockReturnValue({status: APICallStatus.SUCCESS});

    const baseProps = {
        onValueSubmit: mockHandleSubmit,
        onValueDelete: mockHandleDelete,
        onDeleteMultipleValues: mockHandleMultipleValues
    };

    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    }));

    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    test('Render Rich Text field', async () => {
        const recordValuesRichText = [
            {
                ...mockRecordValuesCommon,
                value: '<p>rich text editor test<p>',
                raw_value: 'new rich text editor test'
            }
        ];
        render(
            <Suspense fallback={<div>Loading</div>}>
                <StandardField
                    element={{
                        ...mockFormElementInput,
                        attribute: {...mockFormAttribute, format: AttributeFormat.rich_text},
                        values: recordValuesRichText
                    }}
                    {...baseProps}
                />
            </Suspense>
        );

        const richTextElem = screen.getByRole('textbox');
        await userEvent.click(richTextElem);

        const richTextElemOpen = richTextElem.parentElement.previousSibling as HTMLElement;
        const menuBarClassNames = richTextElemOpen?.getAttribute('class');
        expect(menuBarClassNames).toContain('menu-bar');
        expect(richTextElemOpen).toBeInTheDocument();

        await userEvent.type(richTextElem, 'new value');

        await userEvent.click(document.body);
        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});
