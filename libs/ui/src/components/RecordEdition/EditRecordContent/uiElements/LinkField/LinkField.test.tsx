// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import LinkField from './LinkField';
import {useLinkRecordsInCreation} from './link-record-in-creation/useLinkRecordsInCreation';
import {useLinkRecordsInEdition} from './link-record-in-edition/useLinkRecordsInEdition';
import {AntForm, KitApp} from 'aristid-ds';
import {
    CalculatedFlags,
    computeCalculatedFlags,
    computeInheritedFlags,
    InheritedFlags
} from '../shared/calculatedInheritedFlags';
import {FormInstance} from 'antd';
import {mockFormElementLink, mockLinkValue} from '_ui/__mocks__/common/form';
import {RecordEditionContext} from '../../hooks/useRecordEditionContext';
import {mockRecord} from '_ui/__mocks__/common/record';
import {MockedLangContextProvider} from '_ui/testing';
import {initialState} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {AttributeType, RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {IPendingValues} from '../../_types';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';

const mockInitialState = {...initialState};
const mockedUseFormInstance = AntForm.useFormInstance as jest.MockedFunction<typeof AntForm.useFormInstance>;
const mockedUseLinkRecordsInCreation = useLinkRecordsInCreation as jest.MockedFunction<typeof useLinkRecordsInCreation>;
const mockedUseLinkRecordsInEdition = useLinkRecordsInEdition as jest.MockedFunction<typeof useLinkRecordsInEdition>;
const mockedComputeCalculatedFlags = computeCalculatedFlags as jest.MockedFunction<typeof computeCalculatedFlags>;
const mockedComputeInheritedFlags = computeInheritedFlags as jest.MockedFunction<typeof computeInheritedFlags>;

jest.mock('./link-record-in-creation/useLinkRecordsInCreation', () => ({
    useLinkRecordsInCreation: jest.fn()
}));

jest.mock('./link-record-in-edition/useLinkRecordsInEdition', () => ({
    useLinkRecordsInEdition: jest.fn()
}));

jest.mock('../shared/calculatedInheritedFlags', () => ({
    computeCalculatedFlags: jest.fn(),
    computeInheritedFlags: jest.fn()
}));

jest.mock('../shared/useOutsideInteractionDetector', () => ({
    useOutsideInteractionDetector: jest.fn()
}));

jest.mock('aristid-ds', () => ({
    ...jest.requireActual('aristid-ds'),
    AntForm: {
        Item: ({children, noStyle, ...props}: any) => (
            <div data-testid="form-item" {...props}>
                {children}
            </div>
        ),
        useFormInstance: jest.fn()
    }
}));

jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
    state: mockInitialState,
    dispatch: jest.fn()
}));

describe('LinkField', () => {
    const linkFieldDefaultProps = {
        element: {
            ...mockFormElementLink,
            settings: {
                ...mockFormElementLink.settings,
                label: {fr: 'tata', en: 'toto'}
            },
            attribute: {
                ...(mockFormElementLink.attribute as RecordFormAttributeLinkAttributeFragment),
                multiple_values: false
            }
        },
        readonly: false,
        formIdToLoad: 'creation',
        onValueSubmit: jest.fn(),
        onValueDelete: jest.fn(),
        onDeleteMultipleValues: jest.fn(),
        metadataEdit: false
    };

    const recordEditionContextDefaultProps = {
        record: mockRecord,
        readOnly: true,
        elements: null
    };

    const calculatedFlagsWithoutCalculatedValue: CalculatedFlags = {
        isCalculatedValue: false,
        isCalculatedOverrideValue: false,
        isCalculatedNotOverrideValue: false,
        calculatedValue: null
    };

    const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
        isInheritedValue: false,
        isInheritedOverrideValue: false,
        isInheritedNotOverrideValue: false,
        inheritedValue: null
    };

    beforeEach(() => {
        jest.clearAllMocks();

        Object.assign(mockInitialState, initialState);

        mockedUseFormInstance.mockReturnValue({
            getFieldError: jest.fn().mockReturnValue([])
        } as unknown as FormInstance);

        mockedComputeCalculatedFlags.mockReturnValue(calculatedFlagsWithoutCalculatedValue);
        mockedComputeInheritedFlags.mockReturnValue(inheritedFlagsWithoutInheritedValue);

        mockedUseLinkRecordsInCreation.mockReturnValue({
            UnlinkAllRecordsInCreation: <div data-testid="unlink-creation">Unlink all records in Creation</div>,
            LinkRecordsInCreation: <div data-testid="link-creation">Link records in Creation with Explorer</div>
        } as any);

        mockedUseLinkRecordsInEdition.mockReturnValue({
            UnlinkAllRecordsInEdition: <div data-testid="unlink-edition">Unlink all records in Edition</div>,
            LinkRecordsInEditionExplorer: <div data-testid="link-edition">Unlink records in Creation with Explorer</div>
        } as any);
    });

    describe('with formIdToLoad equal to creation', () => {
        it('should call useLinkRecordsInCreation with default props', () => {
            render(
                <KitApp>
                    <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                        <MockedLangContextProvider>
                            <LinkField {...linkFieldDefaultProps} formIdToLoad="creation" />
                        </MockedLangContextProvider>
                    </RecordEditionContext.Provider>
                </KitApp>
            );

            expect(screen.getByTestId('unlink-creation')).toBeInTheDocument();
            expect(screen.getByTestId('link-creation')).toBeInTheDocument();

            expect(screen.queryByTestId('unlink-edition')).not.toBeInTheDocument();
            expect(screen.queryByTestId('link-edition')).not.toBeInTheDocument();

            expect(mockedUseLinkRecordsInCreation).toHaveBeenCalled();

            const callArgs = mockedUseLinkRecordsInCreation.mock.calls[0][0];

            expect(callArgs.attribute).toBe(linkFieldDefaultProps.element.attribute);
            expect(callArgs.libraryId).toBe(linkFieldDefaultProps.element.attribute.linked_library.id);
            expect(callArgs.pendingValues).toEqual([]);
            expect(callArgs.activeAttribute).toBe(null);
            expect(callArgs.isHookUsed).toBe(true);
            expect(callArgs.isReadOnly).toBe(false);
            expect(callArgs.isFieldInError).toBe(false);
        });

        it('should call useLinkRecordsInCreation with isReadOnly to true', () => {
            render(
                <KitApp>
                    <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                        <MockedLangContextProvider>
                            <LinkField {...linkFieldDefaultProps} formIdToLoad="creation" readonly={true} />
                        </MockedLangContextProvider>
                    </RecordEditionContext.Provider>
                </KitApp>
            );

            const callArgs = mockedUseLinkRecordsInCreation.mock.calls[0][0];
            expect(callArgs.isReadOnly).toBe(true);
        });

        it('should call useLinkRecordsInCreation with isFieldError to true', () => {
            mockedUseFormInstance.mockReturnValue({
                getFieldError: jest.fn().mockReturnValue(['Erreur de test'])
            } as unknown as FormInstance);

            render(
                <KitApp>
                    <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                        <MockedLangContextProvider>
                            <LinkField {...linkFieldDefaultProps} formIdToLoad="creation" />
                        </MockedLangContextProvider>
                    </RecordEditionContext.Provider>
                </KitApp>
            );

            const callArgs = mockedUseLinkRecordsInCreation.mock.calls[0][0];
            expect(callArgs.isFieldInError).toBe(true);
        });

        it('should call useLinkRecordsInCreation with pendingValues', () => {
            const firstPendingValue = {
                id_value: 'pending-1',
                attribute: {
                    id: 'test-attribute',
                    type: AttributeType.advanced_link,
                    system: false
                },
                linkValue: {
                    id: 'link-1',
                    whoAmI: {
                        id: 'who-1',
                        label: 'Pending 1',
                        library: {id: 'lib-1'}
                    }
                }
            };

            const secondPendingValue = {
                id_value: 'pending-2',
                attribute: {
                    id: 'test-attribute',
                    type: AttributeType.advanced_link,
                    system: false
                },
                linkValue: {
                    id: 'link-2',
                    whoAmI: {
                        id: 'who-2',
                        label: 'Pending 2',
                        library: {id: 'lib-1'}
                    }
                }
            };

            const pendingValues: IPendingValues = {
                [linkFieldDefaultProps.element.attribute.id]: {
                    [firstPendingValue.id_value]: firstPendingValue,
                    [secondPendingValue.id_value]: secondPendingValue
                }
            };

            render(
                <KitApp>
                    <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                        <MockedLangContextProvider>
                            <LinkField
                                {...linkFieldDefaultProps}
                                formIdToLoad="creation"
                                pendingValues={pendingValues}
                            />
                        </MockedLangContextProvider>
                    </RecordEditionContext.Provider>
                </KitApp>
            );

            const callArgs = mockedUseLinkRecordsInCreation.mock.calls[0][0];
            expect(callArgs.pendingValues).toEqual([firstPendingValue, secondPendingValue]);
        });
    });

    describe('with formIdToLoad different from creation', () => {
        it('should call useLinkRecordsInEdition with default props', () => {
            mockInitialState.libraryId = 'test_lib';
            mockInitialState.record = mockRecord;

            render(
                <KitApp>
                    <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                        <MockedLangContextProvider>
                            <LinkField {...linkFieldDefaultProps} formIdToLoad="edition" />
                        </MockedLangContextProvider>
                    </RecordEditionContext.Provider>
                </KitApp>
            );

            expect(screen.getByTestId('unlink-edition')).toBeInTheDocument();
            expect(screen.getByTestId('link-edition')).toBeInTheDocument();

            expect(screen.queryByTestId('unlink-creation')).not.toBeInTheDocument();
            expect(screen.queryByTestId('link-creation')).not.toBeInTheDocument();

            expect(mockedUseLinkRecordsInEdition).toHaveBeenCalled();

            const callArgs = mockedUseLinkRecordsInEdition.mock.calls[0][0];

            expect(callArgs.libraryId).toBe(linkFieldDefaultProps.element.attribute.linked_library.id);
            expect(callArgs.recordId).toBe(mockRecord.id);
            expect(callArgs.attribute).toBe(linkFieldDefaultProps.element.attribute);
            expect(callArgs.columnsToDisplay).toBe(undefined);
            expect(callArgs.backendValues).toEqual([mockLinkValue]);
            expect(callArgs.activeAttribute).toBe(null);
            expect(callArgs.isHookUsed).toBe(true);
            expect(callArgs.isReadOnly).toBe(false);
            expect(callArgs.isFieldInError).toBe(false);
            expect(callArgs.hasNoValue).toBe(false);
        });

        it('should call useLinkRecordsInEdition with isReadOnly to true', () => {
            render(
                <KitApp>
                    <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                        <MockedLangContextProvider>
                            <LinkField {...linkFieldDefaultProps} formIdToLoad="edition" readonly={true} />
                        </MockedLangContextProvider>
                    </RecordEditionContext.Provider>
                </KitApp>
            );

            const callArgs = mockedUseLinkRecordsInEdition.mock.calls[0][0];
            expect(callArgs.isReadOnly).toBe(true);
        });

        it('should call useLinkRecordsInEdition with isFieldError to true', () => {
            mockedUseFormInstance.mockReturnValue({
                getFieldError: jest.fn().mockReturnValue(['Erreur de test'])
            } as unknown as FormInstance);

            render(
                <KitApp>
                    <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                        <MockedLangContextProvider>
                            <LinkField {...linkFieldDefaultProps} formIdToLoad="edition" />
                        </MockedLangContextProvider>
                    </RecordEditionContext.Provider>
                </KitApp>
            );

            const callArgs = mockedUseLinkRecordsInEdition.mock.calls[0][0];
            expect(callArgs.isFieldInError).toBe(true);
        });
    });
});
