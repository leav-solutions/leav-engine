import {act, renderHook} from '@testing-library/react';
import {useAutomationFormNavigation} from './useAutomationFormNavigation';

const mockOpenConfirmModal = jest.fn();
jest.mock('_ui/hooks/useConfirmModal', () => ({
    useConfirmModal: () => ({openConfirmModal: mockOpenConfirmModal}),
}));

describe('useAutomationFormNavigation', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('handleCancel', () => {
        describe('when there are no unsaved changes', () => {
            test('calls onCancel directly without opening a modal', () => {
                const mockOnCancel = jest.fn();

                const {result} = renderHook(() =>
                    useAutomationFormNavigation({hasUnsavedChanges: false, onCancel: mockOnCancel}),
                );

                act(() => {
                    result.current.handleCancel();
                });

                expect(mockOnCancel).toHaveBeenCalledTimes(1);
                expect(mockOpenConfirmModal).not.toHaveBeenCalled();
            });
        });

        describe('when there are unsaved changes', () => {
            test('opens a confirmation modal instead of calling onCancel directly', () => {
                const mockOnCancel = jest.fn();

                const {result} = renderHook(() =>
                    useAutomationFormNavigation({hasUnsavedChanges: true, onCancel: mockOnCancel}),
                );

                act(() => {
                    result.current.handleCancel();
                });

                expect(mockOpenConfirmModal).toHaveBeenCalledTimes(1);
                expect(mockOnCancel).not.toHaveBeenCalled();
            });

            test('the modal onOk callback calls onCancel', () => {
                const mockOnCancel = jest.fn();

                const {result} = renderHook(() =>
                    useAutomationFormNavigation({hasUnsavedChanges: true, onCancel: mockOnCancel}),
                );

                act(() => {
                    result.current.handleCancel();
                });

                const {onOk} = mockOpenConfirmModal.mock.calls[0][0];

                act(() => {
                    onOk();
                });

                expect(mockOnCancel).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('popstate listener', () => {
        test('triggers handleCancel on popstate event', () => {
            const mockOnCancel = jest.fn();

            renderHook(() => useAutomationFormNavigation({hasUnsavedChanges: false, onCancel: mockOnCancel}));

            act(() => {
                window.dispatchEvent(new PopStateEvent('popstate'));
            });

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        test('removes the listener on unmount', () => {
            const mockOnCancel = jest.fn();
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            const {unmount} = renderHook(() =>
                useAutomationFormNavigation({hasUnsavedChanges: false, onCancel: mockOnCancel}),
            );

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });
    });
});
