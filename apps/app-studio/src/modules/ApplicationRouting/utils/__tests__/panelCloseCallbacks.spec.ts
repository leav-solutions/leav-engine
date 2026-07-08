import {consumePanelCloseCallback, getPanelCloseCallbackKey, registerPanelCloseCallback} from '../panelCloseCallbacks';

describe('panelCloseCallbacks', () => {
    describe('getPanelCloseCallbackKey', () => {
        it('builds a stable key from recordId / where / recordPanelId', () => {
            expect(getPanelCloseCallbackKey({recordId: 'rec', where: 'popup', recordPanelId: 'creation'})).toBe(
                'rec/popup/creation',
            );
        });
    });

    it('registers then consumes a callback once', () => {
        const key = {recordId: 'rec1', where: 'popup', recordPanelId: 'creation'};
        const callback = vi.fn();

        registerPanelCloseCallback({recordId: 'rec1', where: 'popup', recordPanelId: 'creation'}, callback);

        const consumed = consumePanelCloseCallback(key);
        consumed?.();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('removes the callback after consuming', () => {
        const key = {recordId: 'rec2', where: 'popup', recordPanelId: 'creation'};

        const callback = vi.fn();
        registerPanelCloseCallback(key, callback);

        expect(consumePanelCloseCallback(key)).toBe(callback);
        expect(consumePanelCloseCallback(key)).toBeUndefined();
    });

    it('returns undefined for an unknown key', () => {
        expect(
            consumePanelCloseCallback({recordId: 'rec2', where: 'popup', recordPanelId: 'creation'}),
        ).toBeUndefined();
    });
});
