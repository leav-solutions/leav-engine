import {act, renderHook} from '_ui/_tests/testUtils';
import {useDelayedLoading} from './useDelayedLoading';

const LOADER_SHOW_DELAY_MS = 200;
const LOADER_MIN_DURATION_MS = 300;

describe('useDelayedLoading', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    describe('when loading resolves before showDelay', () => {
        it('should never show the loader', () => {
            const {result, rerender} = renderHook(({loading}) => useDelayedLoading(loading), {
                initialProps: {loading: true},
            });

            act(() => {
                vi.advanceTimersByTime(LOADER_SHOW_DELAY_MS - 50);
            });

            act(() => {
                rerender({loading: false});
            });

            act(() => {
                vi.advanceTimersByTime(LOADER_SHOW_DELAY_MS + LOADER_MIN_DURATION_MS);
            });

            expect(result.current).toBe(false);
        });
    });

    describe('when loading resolves between showDelay and showDelay + minDuration', () => {
        it('should not be visible before showDelay', () => {
            const {result} = renderHook(() => useDelayedLoading(true));

            act(() => {
                vi.advanceTimersByTime(LOADER_SHOW_DELAY_MS - 1);
            });

            expect(result.current).toBe(false);
        });

        it('should be visible after showDelay', () => {
            const {result} = renderHook(() => useDelayedLoading(true));

            act(() => {
                vi.advanceTimersByTime(LOADER_SHOW_DELAY_MS);
            });

            expect(result.current).toBe(true);
        });

        it('should remain visible until showDelay + minDuration even when loading is already false', () => {
            const {result, rerender} = renderHook(({loading}) => useDelayedLoading(loading), {
                initialProps: {loading: true},
            });

            const elapsedBeforeResolve = LOADER_SHOW_DELAY_MS + 50;

            act(() => {
                vi.advanceTimersByTime(elapsedBeforeResolve);
            });

            act(() => {
                rerender({loading: false});
            });

            expect(result.current).toBe(true);

            act(() => {
                vi.advanceTimersByTime(LOADER_SHOW_DELAY_MS + LOADER_MIN_DURATION_MS - elapsedBeforeResolve - 1);
            });

            expect(result.current).toBe(true);

            act(() => {
                vi.advanceTimersByTime(1);
            });

            expect(result.current).toBe(false);
        });
    });

    describe('when loading resolves after showDelay + minDuration', () => {
        it('should be visible after showDelay', () => {
            const {result} = renderHook(() => useDelayedLoading(true));

            act(() => {
                vi.advanceTimersByTime(LOADER_SHOW_DELAY_MS);
            });

            expect(result.current).toBe(true);
        });

        it('should hide the loader as soon as loading becomes false', () => {
            const {result, rerender} = renderHook(({loading}) => useDelayedLoading(loading), {
                initialProps: {loading: true},
            });

            act(() => {
                vi.advanceTimersByTime(LOADER_SHOW_DELAY_MS + LOADER_MIN_DURATION_MS + 100);
            });

            act(() => {
                rerender({loading: false});
            });

            expect(result.current).toBe(false);
        });
    });
});
