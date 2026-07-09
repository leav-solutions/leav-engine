import {act, renderHook} from '@testing-library/react';
import {useFullscreenAlertDismissal} from '../useFullscreenAlertDismissal';

const KEY = 'fullscreenAlertDismissed';

describe('useFullscreenAlertDismissal', () => {
    beforeEach(() => localStorage.clear());

    it('should not be dismissed when the flag is absent', () => {
        const {result} = renderHook(() => useFullscreenAlertDismissal());
        expect(result.current.isDismissed).toBe(false);
    });

    it('should be dismissed when the flag is present', () => {
        localStorage.setItem(KEY, 'true');
        const {result} = renderHook(() => useFullscreenAlertDismissal());
        expect(result.current.isDismissed).toBe(true);
    });

    it('should persist dismissal and flip isDismissed', () => {
        const {result} = renderHook(() => useFullscreenAlertDismissal());
        act(() => result.current.dismiss());
        expect(result.current.isDismissed).toBe(true);
        expect(localStorage.getItem(KEY)).toBe('true');
    });
});
