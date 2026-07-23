import {useRef} from 'react';

/**
 * Returns `value`, but freezes it while `isFrozen` is true:
 * during a freeze window, returns the last value seen outside of freeze.
 * Used to prevent the Explorer's result count from dropping to 0
 * during a filter-triggered reload (LEAVC-587).
 *
 * @param value - current value
 * @param isFrozen - when `true`, keeps the last value seen outside of freeze
 * @returns the current value outside of freeze, otherwise the last frozen value
 */
export const useStickyValue = <T>(value: T, isFrozen: boolean): T => {
    const ref = useRef(value);
    if (!isFrozen) {
        ref.current = value;
    }
    return ref.current;
};
