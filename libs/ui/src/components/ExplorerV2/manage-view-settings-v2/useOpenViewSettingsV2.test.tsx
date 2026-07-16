import {renderHook} from '@testing-library/react';
import {type ReactElement} from 'react';
import {type SortOrder} from '_ui/_gqlTypes';
import {type ViewSettingsShortcuts} from '../_types';
import {useOpenViewSettingsV2} from './useOpenViewSettingsV2';
import {viewSettingsInitialState} from './store-view-settings/viewSettingsInitialState';
import {type IViewSettingsState} from './store-view-settings/viewSettingsReducer';

const makeView = (shortcuts: ViewSettingsShortcuts[], sort: IViewSettingsState['sort'] = []): IViewSettingsState => ({
    ...viewSettingsInitialState,
    viewId: 'view-1',
    shortcuts,
    sort,
});

interface ISetupOptions {
    sort?: IViewSettingsState['sort'];
    showFilters?: boolean;
    showSorts?: boolean;
    hasActiveFilters?: boolean;
}

const setup = (shortcuts: ViewSettingsShortcuts[], options: ISetupOptions = {}) =>
    renderHook(() =>
        useOpenViewSettingsV2({
            isEnabled: true,
            view: makeView(shortcuts, options.sort ?? []),
            showFilters: options.showFilters ?? true,
            showSorts: options.showSorts ?? true,
            hasActiveFilters: options.hasActiveFilters ?? false,
            open: true,
            onViewSettingsShortcutClick: vi.fn(),
        }),
    );

const renderedShortcutKeys = (buttons: ReactElement[] | null): ViewSettingsShortcuts[] =>
    (buttons ?? []).map(button => button.key as ViewSettingsShortcuts);

const dotByKey = (buttons: ReactElement[] | null, key: ViewSettingsShortcuts): boolean | undefined => {
    const button = (buttons ?? []).find(candidate => candidate.key === key);
    if (!button) {
        return undefined;
    }
    const badge = button.props.children as ReactElement<{dot?: boolean}>;
    return badge.props.dot;
};

const activeSort: IViewSettingsState['sort'] = [{field: 'label', order: 'asc' as SortOrder}];

describe('useOpenViewSettingsV2', () => {
    test('renders one button per shortcut listed in the view', () => {
        const {result} = setup(['display', 'filters']);

        expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display', 'filters']);
    });

    test('always renders the shortcuts in the canonical order, whatever the stored order', () => {
        const {result} = setup(['display', 'catalog', 'sorts']);

        expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual([
            'catalog',
            'display',
            'sorts',
        ]);
    });

    test('falls back to the display shortcut when the view has none', () => {
        const {result} = setup([]);

        expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display']);
    });

    describe('filters shortcut button and its active-state dot', () => {
        test('is forced into the toolbar when not a configured shortcut but a filter is active', () => {
            const {result} = setup(['display'], {showFilters: true, hasActiveFilters: true});

            expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display', 'filters']);
            expect(dotByKey(result.current.viewSettingsShortcutsButtons, 'filters')).toBe(true);
        });

        test('is not forced into the toolbar when not a configured shortcut and no filter is active', () => {
            const {result} = setup(['display'], {showFilters: true, hasActiveFilters: false});

            expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display']);
        });

        test('stays displayed when already a configured shortcut, with the dot reflecting the active state', () => {
            const {result: withActiveFilter} = setup(['display', 'filters'], {
                showFilters: true,
                hasActiveFilters: true,
            });
            expect(renderedShortcutKeys(withActiveFilter.current.viewSettingsShortcutsButtons)).toEqual([
                'display',
                'filters',
            ]);
            expect(dotByKey(withActiveFilter.current.viewSettingsShortcutsButtons, 'filters')).toBe(true);

            const {result: withoutActiveFilter} = setup(['display', 'filters'], {
                showFilters: true,
                hasActiveFilters: false,
            });
            expect(renderedShortcutKeys(withoutActiveFilter.current.viewSettingsShortcutsButtons)).toEqual([
                'display',
                'filters',
            ]);
            expect(dotByKey(withoutActiveFilter.current.viewSettingsShortcutsButtons, 'filters')).toBe(false);
        });

        test('is never forced when showFilters is false, even with an active filter', () => {
            const {result} = setup(['display'], {showFilters: false, hasActiveFilters: true});

            expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display']);
        });
    });

    describe('sorts shortcut button and its active-state dot', () => {
        test('is forced into the toolbar when not a configured shortcut but a sort is active', () => {
            const {result} = setup(['display'], {showSorts: true, sort: activeSort});

            expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display', 'sorts']);
            expect(dotByKey(result.current.viewSettingsShortcutsButtons, 'sorts')).toBe(true);
        });

        test('is not forced into the toolbar when not a configured shortcut and no sort is active', () => {
            const {result} = setup(['display'], {showSorts: true, sort: []});

            expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display']);
        });

        test('stays displayed when already a configured shortcut, with the dot reflecting the active state', () => {
            const {result: withActiveSort} = setup(['display', 'sorts'], {
                showSorts: true,
                sort: activeSort,
            });
            expect(renderedShortcutKeys(withActiveSort.current.viewSettingsShortcutsButtons)).toEqual([
                'display',
                'sorts',
            ]);
            expect(dotByKey(withActiveSort.current.viewSettingsShortcutsButtons, 'sorts')).toBe(true);

            const {result: withoutActiveSort} = setup(['display', 'sorts'], {
                showSorts: true,
                sort: [],
            });
            expect(renderedShortcutKeys(withoutActiveSort.current.viewSettingsShortcutsButtons)).toEqual([
                'display',
                'sorts',
            ]);
            expect(dotByKey(withoutActiveSort.current.viewSettingsShortcutsButtons, 'sorts')).toBe(false);
        });

        test('is never forced when showSorts is false, even with an active sort', () => {
            const {result} = setup(['display'], {showSorts: false, sort: activeSort});

            expect(renderedShortcutKeys(result.current.viewSettingsShortcutsButtons)).toEqual(['display']);
        });
    });

    test('the dot is always false for catalog and display shortcuts, which have no active-state notion', () => {
        const {result} = setup(['catalog', 'display'], {showFilters: true, showSorts: true, hasActiveFilters: true});

        expect(dotByKey(result.current.viewSettingsShortcutsButtons, 'catalog')).toBe(false);
        expect(dotByKey(result.current.viewSettingsShortcutsButtons, 'display')).toBe(false);
    });
});
