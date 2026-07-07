import {renderHook} from '@testing-library/react';
import {useClearThreadActionCallbacksOnClose} from '../useClearThreadActionCallbacksOnClose';
import {getThreadActionCallbacks, registerThreadActionCallbacks} from '../../../../stores/threadActionCallbacks';

describe('useClearThreadActionCallbacksOnClose', () => {
    it('should clear the registered callbacks for the given where on unmount', () => {
        registerThreadActionCallbacks({where: 'slider'}, {onCommentSubmitted: jest.fn()});

        const {unmount} = renderHook(() => useClearThreadActionCallbacksOnClose('slider'));

        expect(getThreadActionCallbacks({where: 'slider'})).toBeDefined();

        unmount();

        expect(getThreadActionCallbacks({where: 'slider'})).toBeUndefined();
    });

    it('should not clear anything while still mounted', () => {
        registerThreadActionCallbacks({where: 'slider'}, {onCommentSubmitted: jest.fn()});

        renderHook(() => useClearThreadActionCallbacksOnClose('slider'));

        expect(getThreadActionCallbacks({where: 'slider'})).toBeDefined();
    });

    it('should do nothing when where is undefined', () => {
        registerThreadActionCallbacks({where: 'slider'}, {onCommentSubmitted: jest.fn()});

        const {unmount} = renderHook(() => useClearThreadActionCallbacksOnClose(undefined));
        unmount();

        expect(getThreadActionCallbacks({where: 'slider'})).toBeDefined();
    });
});
