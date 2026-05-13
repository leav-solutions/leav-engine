import {renderHook, act} from '@testing-library/react';
import {useUnlinkRecord} from './useUnlinkRecord';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockLinkValue} from '_ui/__mocks__/common/form';
import {APICallStatus} from '../../../../_types';

const mockOnValueDelete = jest.fn();
const mockSetBackendValues = jest.fn();
const mockSetFields = jest.fn();
const mockKitModalConfirm = jest.fn();

const mockBackendValue = {...mockLinkValue, id_value: 'existing_id_value'};

jest.mock('aristid-ds', () => ({
    AntForm: {
        useFormInstance: jest.fn(() => ({
            setFields: mockSetFields,
        })),
    },
    KitModal: {
        confirm: (config: any) => {
            mockKitModalConfirm(config);
            return config;
        },
    },
}));

const defaultProps = {
    attribute: mockFormAttribute,
    backendValues: [mockBackendValue],
    isReadOnly: false,
    setBackendValues: mockSetBackendValues,
    onValueDelete: mockOnValueDelete,
};

describe('useUnlinkRecord', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('canUnlinkRecord', () => {
        it('should be true when field is not read only and not required', () => {
            const {result} = renderHook(() =>
                useUnlinkRecord({
                    ...defaultProps,
                    attribute: {...mockFormAttribute, required: false},
                    isReadOnly: false,
                }),
            );

            expect(result.current.canUnlinkRecord).toBe(true);
        });

        it('should be true when field is required but has more than one value', () => {
            const {result} = renderHook(() =>
                useUnlinkRecord({
                    ...defaultProps,
                    attribute: {...mockFormAttribute, required: true},
                    backendValues: [mockBackendValue, mockBackendValue],
                    isReadOnly: false,
                }),
            );

            expect(result.current.canUnlinkRecord).toBe(true);
        });

        it('should be false when field is read only', () => {
            const {result} = renderHook(() =>
                useUnlinkRecord({
                    ...defaultProps,
                    isReadOnly: true,
                }),
            );

            expect(result.current.canUnlinkRecord).toBe(false);
        });

        it('should be false when field is required and has only one value', () => {
            const {result} = renderHook(() =>
                useUnlinkRecord({
                    ...defaultProps,
                    attribute: {...mockFormAttribute, required: true},
                    backendValues: [mockBackendValue],
                    isReadOnly: false,
                }),
            );

            expect(result.current.canUnlinkRecord).toBe(false);
        });
    });

    describe('when calling unlinkRecord', () => {
        it('should open a confirmation modal', () => {
            const {result} = renderHook(() => useUnlinkRecord(defaultProps));

            result.current.unlinkRecord('id_value_to_delete');

            expect(mockKitModalConfirm).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'confirm',
                    title: 'record_edition.delete_link',
                    onOk: expect.any(Function),
                }),
            );
        });
    });

    describe('when confirming and deletion succeeds', () => {
        beforeEach(() => {
            mockOnValueDelete.mockResolvedValue({status: APICallStatus.SUCCESS});
        });

        it('should call onValueDelete with correct arguments and update backendValues', async () => {
            const {result} = renderHook(() => useUnlinkRecord(defaultProps));

            result.current.unlinkRecord('id_value_to_delete');

            const modalConfig = mockKitModalConfirm.mock.calls[0][0];

            await act(async () => {
                await modalConfig.onOk();
            });

            expect(mockOnValueDelete).toHaveBeenCalledWith({id_value: 'id_value_to_delete'}, mockFormAttribute.id);
            expect(mockSetBackendValues).toHaveBeenCalled();

            const filterFn = mockSetBackendValues.mock.calls[0][0];
            const filteredValues = filterFn([{id_value: 'id_value_to_delete'}, {id_value: 'other_value'}]);

            expect(filteredValues).toEqual([{id_value: 'other_value'}]);
        });
    });

    describe('when confirming and deletion fails', () => {
        const errorMessage = 'Deletion failed';

        beforeEach(() => {
            mockOnValueDelete.mockResolvedValue({status: APICallStatus.ERROR, error: errorMessage});
        });

        it('should not update backendValues and display error on form field', async () => {
            const {result} = renderHook(() => useUnlinkRecord(defaultProps));

            result.current.unlinkRecord('id_value_to_delete');

            const modalConfig = mockKitModalConfirm.mock.calls[0][0];

            await act(async () => {
                await modalConfig.onOk();
            });

            expect(mockSetBackendValues).not.toHaveBeenCalled();
            expect(mockSetFields).toHaveBeenCalledWith([
                {
                    name: mockFormAttribute.id,
                    errors: [errorMessage],
                },
            ]);
        });
    });
});
