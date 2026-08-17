import {act, renderHook} from '@testing-library/react';
import {AutomationRuleEventAction} from '../../../../../_gqlTypes';
import {useAutomationFilters} from './useAutomationFilters';

describe('useAutomationFilters', () => {
    beforeEach(() => vi.clearAllMocks());

    test('gqlFilters is undefined when no filter is active', () => {
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: vi.fn()}));

        expect(result.current.gqlFilters).toBeUndefined();
    });

    test('library alone produces a trigger.eventTopic without an attribute key', () => {
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: vi.fn()}));

        act(() => {
            result.current.onFilterChange('library', 'products');
        });

        expect(result.current.gqlFilters).toEqual({
            trigger: {eventTopic: {library: 'products'}},
        });
    });

    test('active: false produces {active: false}, not an empty object', () => {
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: vi.fn()}));

        act(() => {
            result.current.onFilterChange('active', false);
        });

        expect(result.current.gqlFilters).toEqual({active: false});
    });

    test('synchronous: false produces {trigger: {synchronous: false}}', () => {
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: vi.fn()}));

        act(() => {
            result.current.onFilterChange('synchronous', false);
        });

        expect(result.current.gqlFilters).toEqual({
            trigger: {synchronous: false},
        });
    });

    test('cumulated filters end up in a single object', () => {
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: vi.fn()}));

        act(() => {
            result.current.onFilterChange('library', 'products');
            result.current.onFilterChange('attribute', 'label');
            result.current.onFilterChange('eventAction', AutomationRuleEventAction.VALUE_SAVE);
            result.current.onFilterChange('active', true);
            result.current.onFilterChange('synchronous', true);
            result.current.onFilterChange('version', '1.2');
        });

        expect(result.current.gqlFilters).toEqual({
            active: true,
            version: '1.2',
            trigger: {
                eventAction: AutomationRuleEventAction.VALUE_SAVE,
                synchronous: true,
                eventTopic: {library: 'products', attribute: 'label'},
            },
        });
    });

    test('changing library resets the selected attribute to null', () => {
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: vi.fn()}));

        act(() => {
            result.current.onFilterChange('library', 'products');
            result.current.onFilterChange('attribute', 'label');
        });

        expect(result.current.filtersValues.attribute).toBe('label');

        act(() => {
            result.current.onFilterChange('library', 'categories');
        });

        expect(result.current.filtersValues.attribute).toBeNull();
        expect(result.current.gqlFilters).toEqual({
            trigger: {eventTopic: {library: 'categories'}},
        });
    });

    test('onFilterReset brings gqlFilters back to undefined', () => {
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: vi.fn()}));

        act(() => {
            result.current.onFilterChange('version', '1.2');
        });
        expect(result.current.gqlFilters).not.toBeUndefined();

        act(() => {
            result.current.onFilterReset();
        });

        expect(result.current.gqlFilters).toBeUndefined();
    });

    test('onFilterChange calls the onFilterChange callback (e.g. to reset the page)', () => {
        const onFilterChangeCallback = vi.fn();
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: onFilterChangeCallback}));

        act(() => {
            result.current.onFilterChange('version', '1.2');
        });

        expect(onFilterChangeCallback).toHaveBeenCalledTimes(1);
    });

    test('onFilterReset calls the onFilterChange callback', () => {
        const onFilterChangeCallback = vi.fn();
        const {result} = renderHook(() => useAutomationFilters({onFilterChange: onFilterChangeCallback}));

        act(() => {
            result.current.onFilterReset();
        });

        expect(onFilterChangeCallback).toHaveBeenCalledTimes(1);
    });
});
