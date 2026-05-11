// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import {useNativePanelMessengerHandlers} from './useNativePanelMessengerHandlers';
import {IFrameMessengerContext, type IIFrameMessengerContext} from './iFrameMessengerContext';
import {type ReactNode} from 'react';

const registerNativePanelHandlersMock = jest.fn().mockReturnValue(jest.fn());
const dispatchToNativePanelMock = jest.fn();

const contextValue: IIFrameMessengerContext = {
    registerHandlers: jest.fn(),
    registerNativePanelHandlers: registerNativePanelHandlersMock,
    dispatchToNativePanel: dispatchToNativePanelMock,
    changeLangInAllFrames: jest.fn(),
};

const wrapper = ({children}: {children: ReactNode}) => (
    <IFrameMessengerContext.Provider value={contextValue}>{children}</IFrameMessengerContext.Provider>
);

describe('useNativePanelMessengerHandlers', () => {
    beforeEach(() => {
        registerNativePanelHandlersMock.mockClear();
        dispatchToNativePanelMock.mockClear();
    });

    it('registers handlers on mount with the given panelId', () => {
        const handlers = {onExplorerViewChanged: jest.fn()};

        renderHook(() => useNativePanelMessengerHandlers('my-panel-id', handlers), {wrapper});

        expect(registerNativePanelHandlersMock).toHaveBeenCalledWith('my-panel-id', handlers);
    });

    it('unregisters handlers on unmount', () => {
        const unregisterMock = jest.fn();
        registerNativePanelHandlersMock.mockReturnValue(unregisterMock);

        const {unmount} = renderHook(() => useNativePanelMessengerHandlers('my-panel-id', {}), {wrapper});

        unmount();

        expect(unregisterMock).toHaveBeenCalled();
    });

    it('dispatch calls dispatchToNativePanel with the target panel id and message', () => {
        const {result} = renderHook(() => useNativePanelMessengerHandlers('my-panel-id', {}), {wrapper});

        const message = {type: 'view-config-update' as const, data: {targetPanelId: 'explorer-1', serializedView: {}}};
        result.current.dispatch('explorer-1', message);

        expect(dispatchToNativePanelMock).toHaveBeenCalledWith('explorer-1', message);
    });
});
