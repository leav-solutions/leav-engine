import {renderHook} from '@testing-library/react';
import {type ReactElement} from 'react';
import {type ViewSettingsShortcuts} from '../_types';
import {useOpenViewSettingsV2} from './useOpenViewSettingsV2';
import {viewSettingsInitialState} from './store-view-settings/viewSettingsInitialState';
import {type IViewSettingsState} from './store-view-settings/viewSettingsReducer';

const makeView = (shortcuts: ViewSettingsShortcuts[]): IViewSettingsState => ({
    ...viewSettingsInitialState,
    viewId: 'view-1',
    shortcuts,
});

const setup = (shortcuts: ViewSettingsShortcuts[]) =>
    renderHook(() =>
        useOpenViewSettingsV2({
            isEnabled: true,
            view: makeView(shortcuts),
            open: true,
            onViewSettingsShortcutClick: jest.fn(),
        }),
    );

const renderedShortcutKeys = (buttons: ReactElement[] | null): ViewSettingsShortcuts[] =>
    (buttons ?? []).map(button => button.key as ViewSettingsShortcuts);

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
});
