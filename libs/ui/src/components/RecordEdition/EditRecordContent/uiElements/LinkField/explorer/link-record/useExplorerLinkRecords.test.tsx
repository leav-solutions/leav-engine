import {renderHook, act} from '@testing-library/react';
import {useExplorerLinkRecords} from './useExplorerLinkRecords';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockLinkValue} from '_ui/__mocks__/common/form';
import {mockModifier} from '_ui/__mocks__/common/value';
import {mockRecord} from '_ui/__mocks__/common/record';
import {APICallStatus, type ISubmitMultipleResult} from '../../../../_types';
import {type ValueDetailsLinkValueFragment} from '_ui/_gqlTypes';
import {ErrorTypes} from '@leav/utils';

const mockSetBackendValues = jest.fn();
const mockSetFields = jest.fn();
const mockSetFieldValue = jest.fn();

const mockBackendValue = {...mockLinkValue, id_value: 'id_value_link'};

const mockBackendValues = [mockBackendValue];

const mockLinkSubmitValue: ValueDetailsLinkValueFragment = {
    id_value: '7891011',
    created_at: 1234567890,
    created_by: {
        ...mockModifier,
    },
    modified_at: 1234567890,
    modified_by: {
        ...mockModifier,
    },
    version: null,
    attribute: {
        ...mockFormAttribute,
        system: false,
    },
    linkValue: {
        id: '7891011',
        whoAmI: {
            ...mockRecord,
        },
    },
    metadata: null,
};

const mockSubmitRes: ISubmitMultipleResult = {
    status: APICallStatus.SUCCESS,
    values: [mockLinkSubmitValue],
};

const mockSubmitResError: ISubmitMultipleResult = {
    status: APICallStatus.ERROR,
    errors: [
        {
            type: 'ERROR',
            message: 'An error occurred',
            attribute: mockFormAttribute.id,
        },
    ],
};

jest.mock('aristid-ds', () => ({
    AntForm: {
        useFormInstance: jest.fn(() => ({
            setFieldValue: mockSetFieldValue,
            setFields: mockSetFields,
        })),
    },
}));

describe('useExplorerLinkRecords', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const {result} = renderHook(() =>
            useExplorerLinkRecords({
                attribute: mockFormAttribute,
                backendValues: [],
                setBackendValues: mockSetBackendValues,
            }),
        );

        expect(result.current.handleExplorerCreateValue).toBeDefined();
        expect(result.current.handleExplorerLinkValue).toBeDefined();
        expect(result.current.handleExplorerMassDeactivateValues).toBeDefined();
        expect(result.current.handleExplorerRemoveValue).toBeDefined();
    });

    describe('handleExplorerRemoveValue', () => {
        it('should remove value when called', () => {
            const {result} = renderHook(() =>
                useExplorerLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                }),
            );

            act(() => {
                result.current.handleExplorerRemoveValue({
                    itemId: mockBackendValue.linkValue.id,
                    key: 'test_attribute',
                    libraryId: mockBackendValue.linkValue.whoAmI.library.id,
                    whoAmI: {...mockBackendValue.linkValue.whoAmI},
                    id_value: mockBackendValue.linkValue.id,
                    propertiesById: {},
                    canDelete: true,
                    canActivate: true,
                    active: true,
                });
            });

            const updateFn = mockSetBackendValues.mock.calls[0][0];

            // Simulate the update function with the current values
            const updatedValues = updateFn(mockBackendValues);

            expect(updatedValues).toEqual([]);
        });

        it('should set field in error if attribute is required', () => {
            const {result} = renderHook(() =>
                useExplorerLinkRecords({
                    attribute: {...mockFormAttribute, required: true},
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                }),
            );

            act(() => {
                result.current.handleExplorerRemoveValue({
                    itemId: mockBackendValue.linkValue.id,
                    key: 'test_attribute',
                    libraryId: mockBackendValue.linkValue.whoAmI.library.id,
                    whoAmI: {...mockBackendValue.linkValue.whoAmI},
                    id_value: mockBackendValue.linkValue.id,
                    propertiesById: {},
                    canDelete: true,
                    canActivate: true,
                    active: true,
                });
            });

            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: ['errors.standard_field_required'],
                },
            ]);
        });
    });

    describe('handleExplorerMassDeactivateValues', () => {
        it('should remove values when called', () => {
            const {result} = renderHook(() =>
                useExplorerLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                }),
            );

            act(() => {
                result.current.handleExplorerMassDeactivateValues(null, [mockBackendValue.id_value]);
            });

            const updateFn = mockSetBackendValues.mock.calls[0][0];
            // Simulate the update function with the current values
            const updatedValues = updateFn(mockBackendValues);

            expect(updatedValues).toEqual([]);
        });

        it('should set field in error if attribute is required', () => {
            const {result} = renderHook(() =>
                useExplorerLinkRecords({
                    attribute: {...mockFormAttribute, required: true},
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                }),
            );

            act(() => {
                result.current.handleExplorerMassDeactivateValues(null, [mockBackendValue.id_value]);
            });

            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: ['errors.standard_field_required'],
                },
            ]);
        });
    });

    describe('handleExplorerLinkValue', () => {
        describe('with successfull response', () => {
            it('should add new values when called', () => {
                const {result} = renderHook(() =>
                    useExplorerLinkRecords({
                        attribute: mockFormAttribute,
                        backendValues: mockBackendValues,
                        setBackendValues: mockSetBackendValues,
                    }),
                );

                act(() => {
                    result.current.handleExplorerLinkValue(mockSubmitRes);
                });

                expect(mockSetFieldValue).toHaveBeenCalledWith('test_attribute', [
                    mockBackendValue.linkValue.id,
                    mockLinkSubmitValue.linkValue.id,
                ]);
                expect(mockSetFields).toHaveBeenCalledWith([{name: mockFormAttribute.id, errors: []}]);
                expect(mockSetBackendValues).toHaveBeenCalled();

                // Simulate the update function with the current values
                const updateFn = mockSetBackendValues.mock.calls[0][0];
                const updatedValues = updateFn(mockBackendValues);
                expect(updatedValues).toEqual([...mockBackendValues, ...mockSubmitRes.values]);
            });
        });

        describe('with error response', () => {
            it('should set field in error using submit result error type', () => {
                const {result} = renderHook(() =>
                    useExplorerLinkRecords({
                        attribute: mockFormAttribute,
                        backendValues: mockBackendValues,
                        setBackendValues: mockSetBackendValues,
                    }),
                );

                act(() => {
                    result.current.handleExplorerLinkValue(mockSubmitResError);
                });

                expect(mockSetFields).toHaveBeenCalledWith([
                    {
                        name: mockFormAttribute.id,
                        errors: [`errors.${mockSubmitResError.errors[0].type}`],
                    },
                ]);
            });

            it('should set field in error using submit result error message', () => {
                const {result} = renderHook(() =>
                    useExplorerLinkRecords({
                        attribute: mockFormAttribute,
                        backendValues: mockBackendValues,
                        setBackendValues: mockSetBackendValues,
                    }),
                );

                act(() => {
                    result.current.handleExplorerLinkValue({
                        ...mockSubmitResError,
                        errors: [{...mockSubmitResError.errors[0], type: ErrorTypes.VALIDATION_ERROR}],
                    });
                });

                expect(mockSetFields).toHaveBeenCalledWith([
                    {
                        name: mockFormAttribute.id,
                        errors: [mockSubmitResError.errors[0].message],
                    },
                ]);
            });
        });
    });

    describe('handleExplorerCreateValue', () => {
        it('should not call handleExplorerLinkValue if saveValuesResultOnLink is not provided', () => {
            const {result} = renderHook(() =>
                useExplorerLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                }),
            );

            act(() => {
                result.current.handleExplorerCreateValue({
                    recordIdCreated: '123456',
                });
            });

            expect(mockSetBackendValues).not.toHaveBeenCalled();
        });

        it('should call handleExplorerLinkValue if saveValuesResultOnLink is provided', () => {
            const {result} = renderHook(() =>
                useExplorerLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                }),
            );

            act(() => {
                result.current.handleExplorerCreateValue({
                    recordIdCreated: '123456',
                    saveValuesResultOnLink: mockSubmitRes,
                });
            });

            expect(mockSetBackendValues).toHaveBeenCalled();

            // Simulate the update function with the current values
            const updateFn = mockSetBackendValues.mock.calls[0][0];
            const updatedValues = updateFn(mockBackendValues);
            expect(updatedValues).toEqual([...mockBackendValues, ...mockSubmitRes.values]);
        });
    });
});
