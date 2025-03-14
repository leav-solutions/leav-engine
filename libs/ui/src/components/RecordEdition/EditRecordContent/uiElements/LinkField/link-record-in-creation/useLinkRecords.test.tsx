// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook, act} from '@testing-library/react';
import {useLinkRecords} from './useLinkRecords';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';

const mockSetFields = jest.fn();

jest.mock('aristid-ds', () => ({
    AntForm: {
        useFormInstance: jest.fn(() => ({
            setFieldValue: jest.fn(),
            setFields: mockSetFields
        }))
    }
}));

const mockOnValueSubmit = jest.fn();
const mockOnValueDelete = jest.fn();

const mockFilterOnIdDefaultFields = {
    id: '',
    attribute: {
        format: AttributeFormat.text,
        label: 'id',
        type: AttributeType.simple
    },
    field: 'id',
    condition: RecordFilterCondition.EQUAL
};

const mockNoRecordFilters = [
    {
        ...mockFilterOnIdDefaultFields,
        value: 'NO_RECORD'
    }
];

describe('useLinkRecords', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const {result} = renderHook(() =>
            useLinkRecords({
                attribute: mockFormAttribute,
                libraryId: mockLibrarySimple.id,
                onValueSubmit: mockOnValueSubmit,
                onValueDelete: mockOnValueDelete
            })
        );

        expect(result.current.selectedRecordIds).toEqual([]);
        expect(result.current.explorerFilters).toEqual(mockNoRecordFilters);
        expect(result.current.explorerKey).toBe(0);
        expect(result.current.hasNoSelectedRecord).toBe(true);
        expect(result.current.canDeleteAllValues).toBe(false);
    });

    it('should link records', () => {
        const {result} = renderHook(() =>
            useLinkRecords({
                attribute: mockFormAttribute,
                libraryId: mockLibrarySimple.id,
                onValueSubmit: mockOnValueSubmit,
                onValueDelete: mockOnValueDelete
            })
        );

        act(() => {
            result.current.linkRecords(['record-1', 'record-2']);
        });

        expect(result.current.selectedRecordIds).toEqual(['record-1', 'record-2']);
        expect(result.current.explorerFilters).toEqual([
            {...mockFilterOnIdDefaultFields, value: 'record-1'},
            {...mockFilterOnIdDefaultFields, value: 'record-2'}
        ]);
        expect(result.current.explorerKey).toBe(1);
        expect(mockOnValueSubmit).toHaveBeenCalledWith(
            [
                {
                    attribute: mockFormAttribute,
                    idValue: null,
                    value: {
                        id: 'record-1',
                        whoAmI: {
                            id: 'record-1',
                            library: {
                                id: mockLibrarySimple.id
                            }
                        }
                    }
                },
                {
                    attribute: mockFormAttribute,
                    idValue: null,
                    value: {
                        id: 'record-2',
                        whoAmI: {
                            id: 'record-2',
                            library: {
                                id: mockLibrarySimple.id
                            }
                        }
                    }
                }
            ],
            null
        );
        expect(result.current.hasNoSelectedRecord).toBe(false);
    });

    it('should unlink records', () => {
        const {result} = renderHook(() =>
            useLinkRecords({
                attribute: mockFormAttribute,
                libraryId: mockLibrarySimple.id,
                onValueSubmit: mockOnValueSubmit,
                onValueDelete: mockOnValueDelete
            })
        );

        act(() => {
            result.current.linkRecords(['record-1', 'record-2']);
        });

        act(() => {
            result.current.unlinkRecords(['record-1']);
        });

        expect(result.current.selectedRecordIds).toEqual(['record-2']);
        expect(result.current.explorerFilters).toEqual([{...mockFilterOnIdDefaultFields, value: 'record-2'}]);
        expect(result.current.explorerKey).toBe(2);
        expect(mockOnValueDelete).toHaveBeenCalledWith({id_value: 'pending_1'}, 'test_attribute');
    });

    it('should unlink the last records and set explorerFilters to NO_RECORD_FILTERS', () => {
        const {result} = renderHook(() =>
            useLinkRecords({
                attribute: mockFormAttribute,
                libraryId: mockLibrarySimple.id,
                onValueSubmit: mockOnValueSubmit,
                onValueDelete: mockOnValueDelete
            })
        );

        act(() => {
            result.current.linkRecords(['record-1']);
        });

        act(() => {
            result.current.unlinkRecords(['record-1']);
        });

        expect(result.current.explorerFilters).toEqual(mockNoRecordFilters);
    });

    it('should unlinking all records', () => {
        const {result} = renderHook(() =>
            useLinkRecords({
                attribute: mockFormAttribute,
                libraryId: mockLibrarySimple.id,
                onValueSubmit: mockOnValueSubmit,
                onValueDelete: mockOnValueDelete
            })
        );

        act(() => {
            result.current.linkRecords(['record-1', 'record-2']);
        });

        act(() => {
            result.current.unlinkRecords();
        });

        expect(result.current.selectedRecordIds).toEqual([]);
        expect(result.current.explorerFilters).toEqual(mockNoRecordFilters);
        expect(result.current.explorerKey).toBe(2);
        expect(result.current.hasNoSelectedRecord).toBe(true);
        expect(mockOnValueDelete).toHaveBeenCalledWith({id_value: 'pending_1'}, 'test_attribute');
        expect(mockOnValueDelete).toHaveBeenCalledWith({id_value: 'pending_2'}, 'test_attribute');
    });

    describe('on required attribute', () => {
        it('should set field in error when unlinking a unique record', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: {...mockFormAttribute, required: true},
                    libraryId: mockLibrarySimple.id,
                    onValueSubmit: mockOnValueSubmit,
                    onValueDelete: mockOnValueDelete
                })
            );

            act(() => {
                result.current.linkRecords(['record-1']);
            });

            act(() => {
                result.current.unlinkRecords(['record-1']);
            });

            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: ['errors.standard_field_required']
                }
            ]);
        });

        it('should set field in error when unlinking all records', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: {...mockFormAttribute, required: true},
                    libraryId: mockLibrarySimple.id,
                    onValueSubmit: mockOnValueSubmit,
                    onValueDelete: mockOnValueDelete
                })
            );

            act(() => {
                result.current.linkRecords(['record-1', 'record-2']);
            });

            act(() => {
                result.current.unlinkRecords();
            });

            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: ['errors.standard_field_required']
                }
            ]);
        });
    });

    describe('on multiple values and non required attribute', () => {
        it('should set canDeleteAllValues to true when linking multiple records', () => {
            const {result} = renderHook(() =>
                useLinkRecords({
                    attribute: {...mockFormAttribute, multiple_values: true},
                    libraryId: mockLibrarySimple.id,
                    onValueSubmit: mockOnValueSubmit,
                    onValueDelete: mockOnValueDelete
                })
            );

            act(() => {
                result.current.linkRecords(['record-1', 'record-2']);
            });

            expect(result.current.canDeleteAllValues).toBe(true);
        });
    });
});
