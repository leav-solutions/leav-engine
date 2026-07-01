import {renderHook, act} from '@testing-library/react';
import {type ReactNode} from 'react';
import {LangContext} from '_ui/contexts';
import {PanelMessengerProvider, usePanelEventHandlers} from '_ui/hooks';

const wrapper = ({children}: {children: ReactNode}) => (
    <LangContext.Provider value={{lang: ['fr'], availableLangs: ['fr', 'en'], defaultLang: 'fr', setLang: vi.fn()}}>
        <PanelMessengerProvider>{children}</PanelMessengerProvider>
    </LangContext.Provider>
);

describe('usePanelEventHandlers', () => {
    it('calls the matching handler with the message data when dispatch is called', async () => {
        const onViewSettingsChanged = vi.fn();
        const onFiltersChanged = vi.fn();

        const {result} = renderHook(
            () =>
                usePanelEventHandlers({
                    'view-settings-changed': onViewSettingsChanged,
                    'filters-changed': onFiltersChanged,
                }),
            {wrapper},
        );

        await act(async () => {
            result.current.dispatch({type: 'view-settings-changed', data: {foo: 'bar'}});
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(onViewSettingsChanged).toHaveBeenCalledWith({foo: 'bar'});
        expect(onFiltersChanged).not.toHaveBeenCalled();
    });

    it('calls all handlers registered for the same event type', async () => {
        const firstHandler = vi.fn();
        const secondHandler = vi.fn();

        const {result} = renderHook(
            () => {
                usePanelEventHandlers({'view-settings-changed': firstHandler});
                return usePanelEventHandlers({'view-settings-changed': secondHandler});
            },
            {wrapper},
        );

        await act(async () => {
            result.current.dispatch({type: 'view-settings-changed', data: {foo: 'bar'}});
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(firstHandler).toHaveBeenCalledWith({foo: 'bar'});
        expect(secondHandler).toHaveBeenCalledWith({foo: 'bar'});
    });

    it('unregisters all handlers on unmount', async () => {
        const onViewSettingsChanged = vi.fn();

        const {result, unmount} = renderHook(
            () => usePanelEventHandlers({'view-settings-changed': onViewSettingsChanged}),
            {wrapper},
        );

        unmount();

        await act(async () => {
            result.current.dispatch({type: 'view-settings-changed', data: {foo: 'bar'}});
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(onViewSettingsChanged).not.toHaveBeenCalled();
    });
});
