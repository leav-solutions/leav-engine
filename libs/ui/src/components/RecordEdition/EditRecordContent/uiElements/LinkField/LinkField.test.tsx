// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings} from '@leav/utils';
import {initialState} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {IUseGetRecordColumnsValuesQueryHook} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {ICustomRenderOptions, render, screen} from '_ui/_tests/testUtils';
import {mockAttributeLink} from '_ui/__mocks__/common/attribute';
import {mockFormElementLink} from '_ui/__mocks__/common/form';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockModifier} from '_ui/__mocks__/common/value';
import {RecordEditionContext} from '../../hooks/useRecordEditionContext';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    FormElement,
    IFormElementProps,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import LinkField from './LinkField';
import {MockedLangContextProvider} from '_ui/testing';

jest.mock('_ui/components/RecordEdition/EditRecord', () => ({
    EditRecord: () => <div>EditRecord</div>
}));

jest.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: (): Partial<IUseGetRecordColumnsValuesQueryHook> => ({
        loading: false,
        data: {
            [mockRecord.id]: {
                _id: null,
                col1: [{value: 'col1 value'}],
                col2: [{value: 'col2 value'}]
            }
        },
        refetch: jest.fn()
    })
}));

jest.mock('_ui/hooks/useRefreshFieldValues', () => ({
    useRefreshFieldValues: () => ({
        fetchValues: jest.fn().mockReturnValue([])
    })
}));

describe('LinkField', () => {
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordDispatch
    }));

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                id_value: '123456',
                created_at: 1234567890,
                created_by: {
                    ...mockModifier
                },
                modified_at: 1234567890,
                modified_by: {
                    ...mockModifier
                },
                value: 'new value',
                version: null,
                attribute: {
                    ...mockAttributeLink,
                    system: false
                },
                linkValue: {
                    id: '123456',
                    whoAmI: {
                        ...mockRecord
                    }
                },
                metadata: null
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});
    const mockHandleDeleteMultipleValues: DeleteMultipleValuesFunc = jest
        .fn()
        .mockReturnValue({status: APICallStatus.SUCCESS});

    const baseProps = {
        onValueSubmit: mockHandleSubmit,
        onValueDelete: mockHandleDelete,
        onDeleteMultipleValues: mockHandleDeleteMultipleValues
    };

    const _renderLinkField = (
        props: Partial<IFormElementProps<ICommonFieldsSettings>>,
        renderOptions?: ICustomRenderOptions
    ) => {
        const allProps = {
            ...baseProps,
            ...(props as IFormElementProps<ICommonFieldsSettings>)
        };

        return render(
            <RecordEditionContext.Provider
                value={{
                    record: mockRecord,
                    readOnly: false,
                    elements: null
                }}
            >
                <MockedLangContextProvider>
                    <LinkField {...allProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>,
            renderOptions
        );
    };

    beforeEach(() => jest.clearAllMocks());

    it('should render LinkField with fr label', () => {
        const mockFormElementLinkNoMultivalue: FormElement<ICommonFieldsSettings> = {
            ...mockFormElementLink,
            settings: {
                ...mockFormElementLink.settings,
                label: {fr: 'tata', en: 'toto'}
            },
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: false
            }
        };

        _renderLinkField({element: {...mockFormElementLinkNoMultivalue}});

        expect(screen.getByText(mockFormElementLinkNoMultivalue.settings.label.fr)).toBeVisible();
    });
    it('should render LinkField with fallback label', () => {
        const mockFormElementLinkNoMultivalue: FormElement<ICommonFieldsSettings> = {
            ...mockFormElementLink,
            settings: {
                ...mockFormElementLink.settings,
                label: {en: 'toto'}
            },
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: false
            }
        };

        _renderLinkField({element: {...mockFormElementLinkNoMultivalue}});

        expect(screen.getByText(mockFormElementLinkNoMultivalue.settings.label.en)).toBeVisible();
    });

    it('should render MonoValueSelect', () => {
        const mockFormElementLinkNoMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: false
            }
        };

        _renderLinkField({element: {...mockFormElementLinkNoMultivalue}});

        expect(screen.getByRole('combobox')).toBeVisible();
    });

    it('should render MultiValueSelect', () => {
        const mockFormElementLinkWithMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: true
            }
        };

        _renderLinkField({element: {...mockFormElementLinkWithMultivalue}});

        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
});
