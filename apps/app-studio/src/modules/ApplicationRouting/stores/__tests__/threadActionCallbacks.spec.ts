import {
    clearThreadActionCallbacks,
    getThreadActionCallbackKey,
    getThreadActionCallbacks,
    registerThreadActionCallbacks,
} from '../threadActionCallbacks';

describe('threadActionCallbacks', () => {
    const key = {where: 'slider'};

    afterEach(() => clearThreadActionCallbacks(key));

    it('should build a stable key from where', () => {
        expect(getThreadActionCallbackKey(key)).toBe('slider');
    });

    it('registers then returns callbacks (multi-fire: not consumed on read)', () => {
        const onCommentSubmitted = vi.fn();
        registerThreadActionCallbacks(key, {onCommentSubmitted});

        getThreadActionCallbacks(key)?.onCommentSubmitted?.();
        getThreadActionCallbacks(key)?.onCommentSubmitted?.();

        expect(onCommentSubmitted).toHaveBeenCalledTimes(2);
    });

    it('should overwrite callbacks when re-registered for the same key', () => {
        const first = vi.fn();
        const second = vi.fn();
        registerThreadActionCallbacks(key, {onCommentSubmitted: first});
        registerThreadActionCallbacks(key, {onCommentSubmitted: second});

        getThreadActionCallbacks(key)?.onCommentSubmitted?.();

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('should clear the entry', () => {
        registerThreadActionCallbacks(key, {onCommentSubmitted: vi.fn()});
        clearThreadActionCallbacks(key);
        expect(getThreadActionCallbacks(key)).toBeUndefined();
    });

    it('should return undefined for an unknown key', () => {
        expect(getThreadActionCallbacks({where: 'popup'})).toBeUndefined();
    });
});
