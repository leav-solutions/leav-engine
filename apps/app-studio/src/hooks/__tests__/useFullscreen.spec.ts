import {act, renderHook} from '@testing-library/react';
import {useFullscreen} from '../useFullscreen';

describe('useFullscreen', () => {
    afterEach(() => {
        const {result} = renderHook(() => useFullscreen());
        act(() => result.current.exitFullscreen());
    });

    it('should default to no panel in fullscreen', () => {
        const {result} = renderHook(() => useFullscreen());
        expect(result.current.fullscreenPanelId).toBeNull();
    });

    it('should enter and exit fullscreen for a given panel', () => {
        const {result} = renderHook(() => useFullscreen());

        act(() => result.current.enterFullscreen('planning'));
        expect(result.current.fullscreenPanelId).toBe('planning');

        act(() => result.current.exitFullscreen());
        expect(result.current.fullscreenPanelId).toBeNull();
    });

    it('should share state across instances', () => {
        const first = renderHook(() => useFullscreen());
        const second = renderHook(() => useFullscreen());

        act(() => first.result.current.enterFullscreen('planning'));

        expect(second.result.current.fullscreenPanelId).toBe('planning');
    });

    it('should exit fullscreen on Escape key', () => {
        const {result} = renderHook(() => useFullscreen());
        act(() => result.current.enterFullscreen('planning'));

        act(() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})));

        expect(result.current.fullscreenPanelId).toBeNull();
    });
});
