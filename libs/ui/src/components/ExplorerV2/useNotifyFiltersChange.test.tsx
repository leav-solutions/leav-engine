import {renderHook} from '@testing-library/react';
import {type UIFilter} from '../Filters/_types';
import {useNotifyFiltersChange} from './useNotifyFiltersChange';

type HookProps = Parameters<typeof useNotifyFiltersChange>[0];

const emptyFilters: UIFilter[] = [];

const setup = (initialProps: HookProps) => renderHook(props => useNotifyFiltersChange(props), {initialProps});

describe('useNotifyFiltersChange', () => {
    test('does not emit while loading', () => {
        const onFiltersChange = jest.fn();
        const {rerender} = setup({isLoading: true, filters: emptyFilters, filtersOperator: 'AND', onFiltersChange});

        rerender({isLoading: true, filters: [], filtersOperator: 'OR', onFiltersChange});

        expect(onFiltersChange).not.toHaveBeenCalled();
    });

    test('skips the first emission once loading completes (initial view, not a user change)', () => {
        const onFiltersChange = jest.fn();
        const {rerender} = setup({isLoading: true, filters: emptyFilters, filtersOperator: 'AND', onFiltersChange});

        rerender({isLoading: false, filters: emptyFilters, filtersOperator: 'AND', onFiltersChange});

        expect(onFiltersChange).not.toHaveBeenCalled();
    });

    test('emits on subsequent filters changes', () => {
        const onFiltersChange = jest.fn();
        const {rerender} = setup({isLoading: false, filters: emptyFilters, filtersOperator: 'AND', onFiltersChange});

        // The first stable render is swallowed by the initial-emission guard.
        expect(onFiltersChange).not.toHaveBeenCalled();

        rerender({isLoading: false, filters: emptyFilters, filtersOperator: 'OR', onFiltersChange});

        expect(onFiltersChange).toHaveBeenCalledTimes(1);
        expect(onFiltersChange).toHaveBeenCalledWith({filters: emptyFilters, filtersOperator: 'OR'});
    });

    test('does not crash when onFiltersChange is undefined', () => {
        const {rerender} = setup({
            isLoading: false,
            filters: emptyFilters,
            filtersOperator: 'AND',
            onFiltersChange: undefined,
        });

        expect(() =>
            rerender({isLoading: false, filters: emptyFilters, filtersOperator: 'OR', onFiltersChange: undefined}),
        ).not.toThrow();
    });
});
