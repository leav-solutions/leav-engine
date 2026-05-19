import {act, renderHook} from '@testing-library/react';
import {useAutomationFormNavigation} from './useAutomationFormNavigation';

const mockOpenConfirmModal = jest.fn();
jest.mock('_ui/hooks/useConfirmModal', () => ({
    useConfirmModal: () => ({openConfirmModal: mockOpenConfirmModal}),
}));

const mockUseBlocker = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useBlocker: (...args: unknown[]) => mockUseBlocker(...args),
}));

describe('useAutomationFormNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseBlocker.mockReturnValue({state: 'unblocked', proceed: jest.fn(), reset: jest.fn()});
    });

    test('the blocker function only blocks when shouldBlockNavigation is true and pathname changes', () => {
        renderHook(() => useAutomationFormNavigation({shouldBlockNavigation: true}));

        const shouldBlock = mockUseBlocker.mock.calls[0][0];

        expect(shouldBlock({currentLocation: {pathname: '/a'}, nextLocation: {pathname: '/b'}})).toBe(true);
        expect(shouldBlock({currentLocation: {pathname: '/a'}, nextLocation: {pathname: '/a'}})).toBe(false);
    });

    test('the blocker function never blocks when shouldBlockNavigation is false', () => {
        renderHook(() => useAutomationFormNavigation({shouldBlockNavigation: false}));

        const shouldBlock = mockUseBlocker.mock.calls[0][0];

        expect(shouldBlock({currentLocation: {pathname: '/a'}, nextLocation: {pathname: '/b'}})).toBe(false);
    });

    test('opens the confirmation modal when blocker state is blocked', () => {
        const proceed = jest.fn();
        const reset = jest.fn();
        mockUseBlocker.mockReturnValue({state: 'blocked', proceed, reset});

        renderHook(() => useAutomationFormNavigation({shouldBlockNavigation: true}));

        expect(mockOpenConfirmModal).toHaveBeenCalledTimes(1);

        const {onOk, onCancel} = mockOpenConfirmModal.mock.calls[0][0];

        act(() => {
            onOk();
        });
        expect(proceed).toHaveBeenCalledTimes(1);

        act(() => {
            onCancel();
        });
        expect(reset).toHaveBeenCalledTimes(1);
    });

    test('does not open the modal when blocker state is unblocked', () => {
        mockUseBlocker.mockReturnValue({state: 'unblocked', proceed: jest.fn(), reset: jest.fn()});

        renderHook(() => useAutomationFormNavigation({shouldBlockNavigation: true}));

        expect(mockOpenConfirmModal).not.toHaveBeenCalled();
    });
});
