// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook, act} from '@testing-library/react';
import {useLinkRecords} from './useLinkRecords';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockLinkValue} from '_ui/__mocks__/common/form';
import {mockModifier} from '_ui/__mocks__/common/value';
import {mockRecord} from '_ui/__mocks__/common/record';
import {APICallStatus, ISubmitMultipleResult} from '../../../_types';
import {ValueDetailsLinkValueFragment} from '_ui/_gqlTypes';
import {ErrorTypes} from '@leav/utils';

const mockOnDeleteMultipleValues = jest.fn();
const mockSetBackendValues = jest.fn();
const mockSetFields = jest.fn();
const mockSetFieldValue = jest.fn();

const mockBackendValue = {...mockLinkValue, id_value: 'id_value_link'};

const mockBackendValues = [mockBackendValue];

const mockLinkSubmitValue: ValueDetailsLinkValueFragment = {
    id_value: '7891011',
    created_at: 1234567890,
    created_by: {
        ...mockModifier
    },
    modified_at: 1234567890,
    modified_by: {
        ...mockModifier
    },
    version: null,
    attribute: {
        ...mockFormAttribute,
        system: false
    },
    linkValue: {
        id: '7891011',
        whoAmI: {
            ...mockRecord
        }
    },
    metadata: null
};

const mockSubmitRes: ISubmitMultipleResult = {
    status: APICallStatus.SUCCESS,
    values: [mockLinkSubmitValue]
};

const mockSubmitResError: ISubmitMultipleResult = {
    status: APICallStatus.ERROR,
    errors: [
        {
            type: 'ERROR',
            message: 'An error occurred',
            attribute: mockFormAttribute.id
        }
    ]
};

jest.mock('aristid-ds', () => ({
    AntForm: {
        useFormInstance: jest.fn(() => ({
            setFieldValue: mockSetFieldValue,
            setFields: mockSetFields
        }))
    }
}));

describe('useLinkRecords', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const {result} = renderHook(() =>
            useLinkRecords({
                attribute: mockFormAttribute,
                backendValues: [],
                setBackendValues: mockSetBackendValues,
                onDeleteMultipleValues: mockOnDeleteMultipleValues
            })
        );

        expect(result.current.handleDeleteAllValues).toBeDefined();
        expect(result.current.handleExplorerCreateValue).toBeDefined();
        expect(result.current.handleExplorerLinkValue).toBeDefined();
        expect(result.current.handleExplorerMassDeactivateValues).toBeDefined();
        expect(result.current.handleExplorerMassDeactivateValues).toBeDefined();
    });

    describe('handleDeleteAllValues', () => {
        it('should remove all values when called', async () => {
            mockOnDeleteMultipleValues.mockResolvedValue({status: 'SUCCESS'});

            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
            );

            await act(async () => {
                await result.current.handleDeleteAllValues();
            });

            expect(mockOnDeleteMultipleValues).toHaveBeenCalledWith(mockFormAttribute.id, [mockBackendValue], null);
            expect(mockSetFieldValue).toHaveBeenCalledWith('test_attribute', []);
            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: []
                }
            ]);
            expect(mockSetBackendValues).toHaveBeenCalledWith([]);
        });

        it('should set field in error if attribute is required', async () => {
            mockOnDeleteMultipleValues.mockResolvedValue({status: 'SUCCESS'});

            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: {...mockFormAttribute, required: true},
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
            );

            await act(async () => {
                await result.current.handleDeleteAllValues();
            });

            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: ['errors.standard_field_required']
                }
            ]);
        });
    });

    describe('handleExplorerRemoveValue', () => {
        it('should remove value when called', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
            );

            act(() => {
                result.current.handleExplorerRemoveValue({
                    itemId: mockBackendValue.linkValue.id,
                    key: 'test_attribute',
                    libraryId: mockBackendValue.linkValue.whoAmI.library.id,
                    whoAmI: {...mockBackendValue.linkValue.whoAmI},
                    id_value: mockBackendValue.linkValue.id,
                    propertiesById: {},
                    canDelete: true
                });
            });

            const updateFn = mockSetBackendValues.mock.calls[0][0];

            // Simulate the update function with the current values
            const updatedValues = updateFn(mockBackendValues);

            expect(updatedValues).toEqual([]);
        });

        it('should set field in error if attribute is required', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: {...mockFormAttribute, required: true},
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
            );

            act(() => {
                result.current.handleExplorerRemoveValue({
                    itemId: mockBackendValue.linkValue.id,
                    key: 'test_attribute',
                    libraryId: mockBackendValue.linkValue.whoAmI.library.id,
                    whoAmI: {...mockBackendValue.linkValue.whoAmI},
                    id_value: mockBackendValue.linkValue.id,
                    propertiesById: {},
                    canDelete: true
                });
            });

            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: ['errors.standard_field_required']
                }
            ]);
        });
    });

    describe('handleExplorerMassDeactivateValues', () => {
        it('should remove values when called', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
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
                useLinkRecords({
                    attribute: {...mockFormAttribute, required: true},
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
            );

            act(() => {
                result.current.handleExplorerMassDeactivateValues(null, [mockBackendValue.id_value]);
            });

            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: ['errors.standard_field_required']
                }
            ]);
        });
    });

    describe('handleExplorerLinkValue', () => {
        describe('with successfull response', () => {
            it('should add new values when called', () => {
                const {result} = renderHook(() =>
                    useLinkRecords({
                        attribute: mockFormAttribute,
                        backendValues: mockBackendValues,
                        setBackendValues: mockSetBackendValues,
                        onDeleteMultipleValues: mockOnDeleteMultipleValues
                    })
                );

                act(() => {
                    result.current.handleExplorerLinkValue(mockSubmitRes);
                });

                expect(mockSetFieldValue).toHaveBeenCalledWith('test_attribute', [
                    mockBackendValue.linkValue.id,
                    mockLinkSubmitValue.linkValue.id
                ]);
                expect(mockSetFields).toHaveBeenCalledWith([{name: mockFormAttribute.id, errors: []}]);
                expect(mockSetBackendValues).toHaveBeenCalledWith(
                    expect.arrayContaining([...mockBackendValues, ...mockSubmitRes.values])
                );
            });
        });

        describe('with error response', () => {
            it('should set field in error using submit result error type', () => {
                const {result} = renderHook(() =>
                    useLinkRecords({
                        attribute: mockFormAttribute,
                        backendValues: mockBackendValues,
                        setBackendValues: mockSetBackendValues,
                        onDeleteMultipleValues: mockOnDeleteMultipleValues
                    })
                );

                act(() => {
                    result.current.handleExplorerLinkValue(mockSubmitResError);
                });

                expect(mockSetFields).toHaveBeenCalledWith([
                    {
                        name: mockFormAttribute.id,
                        errors: [`errors.${mockSubmitResError.errors[0].type}`]
                    }
                ]);
            });

            it('should set field in error using submit result error message', () => {
                const {result} = renderHook(() =>
                    useLinkRecords({
                        attribute: mockFormAttribute,
                        backendValues: mockBackendValues,
                        setBackendValues: mockSetBackendValues,
                        onDeleteMultipleValues: mockOnDeleteMultipleValues
                    })
                );

                act(() => {
                    result.current.handleExplorerLinkValue({
                        ...mockSubmitResError,
                        errors: [{...mockSubmitResError.errors[0], type: ErrorTypes.VALIDATION_ERROR}]
                    });
                });

                expect(mockSetFields).toHaveBeenCalledWith([
                    {
                        name: mockFormAttribute.id,
                        errors: [mockSubmitResError.errors[0].message]
                    }
                ]);
            });
        });
    });

    describe('handleExplorerCreateValue', () => {
        it('should not call handleExplorerLinkValue if saveValuesResultOnLink is not provided', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
            );

            act(() => {
                result.current.handleExplorerCreateValue({
                    recordIdCreated: '123456'
                });
            });

            expect(mockSetBackendValues).not.toHaveBeenCalled();
        });

        it('should call handleExplorerLinkValue if saveValuesResultOnLink is provided', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: mockFormAttribute,
                    backendValues: mockBackendValues,
                    setBackendValues: mockSetBackendValues,
                    onDeleteMultipleValues: mockOnDeleteMultipleValues
                })
            );

            act(() => {
                result.current.handleExplorerCreateValue({
                    recordIdCreated: '123456',
                    saveValuesResultOnLink: mockSubmitRes
                });
            });

            expect(mockSetBackendValues).toHaveBeenCalledWith(
                expect.arrayContaining([...mockBackendValues, ...mockSubmitRes.values])
            );
        });
    });
});
