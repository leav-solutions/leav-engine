import {render, screen, renderHook, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useUnlinkAllRecords} from './useUnlinkAllRecords';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockLinkValue} from '_ui/__mocks__/common/form';
import {APICallStatus} from '../../../_types';

const mockOnDeleteMultipleValues = jest.fn();
const mockSetBackendValues = jest.fn();
const mockSetFields = jest.fn();
const mockSetFieldValue = jest.fn();
const mockKitModalConfirm = jest.fn();

const mockBackendValue = {...mockLinkValue, id_value: 'id_value_link'};

jest.mock('aristid-ds', () => ({
    AntForm: {
        useFormInstance: jest.fn(() => ({
            setFieldValue: mockSetFieldValue,
            setFields: mockSetFields,
        })),
    },
    KitButton: ({children, onClick, danger, ...props}: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
    KitModal: {
        confirm: (config: any) => {
            mockKitModalConfirm(config);
            config.onOk();
        },
    },
}));

const defaultProps = {
    attribute: {...mockFormAttribute, multiple_values: true, required: false},
    backendValues: [mockBackendValue, mockBackendValue],
    setBackendValues: mockSetBackendValues,
    onDeleteMultipleValues: mockOnDeleteMultipleValues,
    isReadOnly: false,
    isFieldInError: false,
};

const UnlinkAllRecordsWrapper = (props: typeof defaultProps) => {
    const {UnlinkAllRecordsButton} = useUnlinkAllRecords(props);
    return <>{UnlinkAllRecordsButton}</>;
};

describe('useUnlinkAllRecords', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('UnlinkAllRecords visibility', () => {
        it('should display button when field is editable, has multiple values and is not required', () => {
            const {result} = renderHook(() => useUnlinkAllRecords(defaultProps));

            expect(result.current.UnlinkAllRecordsButton).toBeTruthy();
        });

        it('should hide button when field is read only', () => {
            const {result} = renderHook(() =>
                useUnlinkAllRecords({
                    ...defaultProps,
                    isReadOnly: true,
                }),
            );

            expect(result.current.UnlinkAllRecordsButton).toBeFalsy();
        });

        it('should hide button when field has less than 2 values', () => {
            const {result} = renderHook(() =>
                useUnlinkAllRecords({
                    ...defaultProps,
                    backendValues: [mockBackendValue],
                }),
            );

            expect(result.current.UnlinkAllRecordsButton).toBeFalsy();
        });

        it('should hide button when field does not allow multiple values', () => {
            const {result} = renderHook(() =>
                useUnlinkAllRecords({
                    ...defaultProps,
                    attribute: {...defaultProps.attribute, multiple_values: false},
                }),
            );

            expect(result.current.UnlinkAllRecordsButton).toBeFalsy();
        });

        it('should hide button when field is required', () => {
            const {result} = renderHook(() =>
                useUnlinkAllRecords({
                    ...defaultProps,
                    attribute: {...defaultProps.attribute, required: true},
                }),
            );

            expect(result.current.UnlinkAllRecordsButton).toBeFalsy();
        });
    });

    describe('when clicking on delete all button', () => {
        it('should clear all values on success', async () => {
            mockOnDeleteMultipleValues.mockResolvedValue({status: APICallStatus.SUCCESS});

            render(<UnlinkAllRecordsWrapper {...defaultProps} />);

            await userEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                expect(mockSetFieldValue).toHaveBeenCalledWith(mockFormAttribute.id, []);
                expect(mockSetBackendValues).toHaveBeenCalledWith([]);
            });
        });

        it('should do nothing on error', async () => {
            mockOnDeleteMultipleValues.mockResolvedValue({status: APICallStatus.ERROR});

            render(<UnlinkAllRecordsWrapper {...defaultProps} />);

            await userEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                expect(mockOnDeleteMultipleValues).toHaveBeenCalled();
            });

            expect(mockSetFieldValue).not.toHaveBeenCalled();
            expect(mockSetBackendValues).not.toHaveBeenCalled();
        });
    });
});
