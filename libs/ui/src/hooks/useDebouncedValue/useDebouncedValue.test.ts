// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook, act} from '_ui/_tests/testUtils';
import {useDebouncedValue} from './useDebouncedValue';

describe('useDebouncedValue', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('should return the initial value', () => {
        const {result} = renderHook(() => useDebouncedValue('initial', 500));

        expect(result.current).toBe('initial');
    });

    test('should update the debounced value after the delay', () => {
        const {result, rerender} = renderHook(({value, delay}) => useDebouncedValue(value, delay), {
            initialProps: {value: 'initial', delay: 500}
        });

        expect(result.current).toBe('initial');

        act(() => {
            rerender({value: 'updated', delay: 500});
        });

        expect(result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    test('should cancel the previous timeout when value changes', () => {
        const {result, rerender} = renderHook(({value, delay}) => useDebouncedValue(value, delay), {
            initialProps: {value: 'initial', delay: 500}
        });

        expect(result.current).toBe('initial');

        rerender({value: 'updated', delay: 500});

        expect(result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(250);
            rerender({value: 'new', delay: 500});
        });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(result.current).toBe('new');
    });
});
