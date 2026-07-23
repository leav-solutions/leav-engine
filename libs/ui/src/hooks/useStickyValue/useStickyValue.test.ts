import {renderHook} from '_ui/_tests/testUtils';
import {useStickyValue} from './useStickyValue';

describe('useStickyValue', () => {
    it('should return the initial value as-is', () => {
        const {result} = renderHook(() => useStickyValue(0, false));

        expect(result.current).toBe(0);
    });

    it('should update the value while not frozen', () => {
        const {result, rerender} = renderHook(({value, isFrozen}) => useStickyValue(value, isFrozen), {
            initialProps: {value: 1, isFrozen: false},
        });

        rerender({value: 2, isFrozen: false});

        expect(result.current).toBe(2);
    });

    it('should keep the last non-frozen value while frozen', () => {
        const {result, rerender} = renderHook(({value, isFrozen}) => useStickyValue(value, isFrozen), {
            initialProps: {value: 5, isFrozen: false},
        });

        expect(result.current).toBe(5);

        rerender({value: 0, isFrozen: true});

        expect(result.current).toBe(5);
    });

    it('should refresh the value once unfrozen again', () => {
        const {result, rerender} = renderHook(({value, isFrozen}) => useStickyValue(value, isFrozen), {
            initialProps: {value: 5, isFrozen: false},
        });

        rerender({value: 0, isFrozen: true});
        expect(result.current).toBe(5);

        rerender({value: 10, isFrozen: false});
        expect(result.current).toBe(10);
    });
});
