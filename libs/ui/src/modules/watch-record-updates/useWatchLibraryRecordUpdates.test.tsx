import {act, renderHook, waitFor} from '_ui/_tests/testUtils';
import * as gqlTypes from '_ui/_gqlTypes';
import {ACTIVE_ATTRIBUTE_ID} from '_ui/constants';
import {useWatchLibraryRecordUpdates} from './useWatchLibraryRecordUpdates';
import {type IWatchLibraryRecordUpdatesParams} from './_types';

const LIBRARY = 'campaigns';
// Short debounce to keep the suite fast; flushes are awaited through waitFor.
const DEBOUNCE_MS = 20;

describe('useWatchLibraryRecordUpdates', () => {
    const subscriptionSpy = vi.spyOn(gqlTypes, 'useRecordUpdateLightSubscription');

    // Captured from the subscription options of the LAST render: firing it simulates the
    // server pushing one recordUpdate event.
    const fireEvent = (recordId: string, updatedAttributeIds: string[] = ['title']) => {
        const {onData} = subscriptionSpy.mock.calls.at(-1)![0]!;
        act(() => {
            onData!({
                data: {
                    data: {
                        recordUpdate: {
                            record: {id: recordId},
                            updatedValues: updatedAttributeIds.map(attribute => ({attribute})),
                        },
                    },
                },
            } as never);
        });
    };

    const renderWatchHook = (paramsOverrides: Partial<IWatchLibraryRecordUpdatesParams> = {}) => {
        const onVisibleRecordsTouched = vi.fn();
        const onListContentMaybeChanged = vi.fn();

        const rendered = renderHook(() =>
            useWatchLibraryRecordUpdates({
                libraryId: LIBRARY,
                skip: false,
                visibleRecordIds: ['r1', 'r2'],
                onVisibleRecordsTouched,
                onListContentMaybeChanged,
                debounceMs: DEBOUNCE_MS,
                ...paramsOverrides,
            }),
        );

        return {onVisibleRecordsTouched, onListContentMaybeChanged, ...rendered};
    };

    beforeEach(() => {
        subscriptionSpy.mockReturnValue({loading: false, restart: vi.fn()} as never);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('flushes updates on visible records as a single debounced batch', async () => {
        // two visible records are edited in quick succession (e.g. by another user)
        const {onVisibleRecordsTouched, onListContentMaybeChanged} = renderWatchHook();

        fireEvent('r1');
        fireEvent('r2');
        fireEvent('r1'); // second event on the same record: no duplicate in the flush

        await waitFor(() => {
            expect(onVisibleRecordsTouched).toHaveBeenCalledTimes(1);
            expect(onVisibleRecordsTouched).toHaveBeenCalledWith(['r1', 'r2']);
            expect(onListContentMaybeChanged).not.toHaveBeenCalled();
        });
    });

    it('signals a possible list content change when an unlisted record switches active', async () => {
        // typical creation flow: a record created above the explorer gets activated on submit
        const {onVisibleRecordsTouched, onListContentMaybeChanged} = renderWatchHook();

        fireEvent('freshly-created', [ACTIVE_ATTRIBUTE_ID]);

        await waitFor(() => {
            expect(onListContentMaybeChanged).toHaveBeenCalledTimes(1);
            expect(onVisibleRecordsTouched).not.toHaveBeenCalled();
        });
    });

    it('collapses an event storm into one single full-content flush', async () => {
        // a mass action emits one event per record: visible edits mixed with unlisted activations
        const {onVisibleRecordsTouched, onListContentMaybeChanged} = renderWatchHook();

        fireEvent('r1');
        fireEvent('mass-deactivated-1', [ACTIVE_ATTRIBUTE_ID]);
        fireEvent('mass-deactivated-2', [ACTIVE_ATTRIBUTE_ID]);
        fireEvent('r2');

        // one full reload covers everything: touched visible records must NOT trigger a second fetch
        await waitFor(() => {
            expect(onListContentMaybeChanged).toHaveBeenCalledTimes(1);
            expect(onVisibleRecordsTouched).not.toHaveBeenCalled();
        });
    });

    it('ignores a plain edit on an unlisted record', async () => {
        // e.g. a record on another page gets one of its values edited
        const {onVisibleRecordsTouched, onListContentMaybeChanged} = renderWatchHook();

        fireEvent('record-on-another-page');

        // let the debounce window elapse before asserting nothing happened
        await new Promise(resolve => setTimeout(resolve, DEBOUNCE_MS * 3));
        expect(onVisibleRecordsTouched).not.toHaveBeenCalled();
        expect(onListContentMaybeChanged).not.toHaveBeenCalled();
    });

    it('swallows events flagged by shouldIgnoreEvent', async () => {
        // e.g. the echo of a write this client just made (kanban drag & drop)
        const {onVisibleRecordsTouched, onListContentMaybeChanged} = renderWatchHook({
            shouldIgnoreEvent: recordId => recordId === 'r1',
        });

        fireEvent('r1');
        fireEvent('r2');

        // the ignored event is fully absent from the flush, the other one goes through
        await waitFor(() => {
            expect(onVisibleRecordsTouched).toHaveBeenCalledTimes(1);
            expect(onVisibleRecordsTouched).toHaveBeenCalledWith(['r2']);
            expect(onListContentMaybeChanged).not.toHaveBeenCalled();
        });
    });

    it('does not open the subscription when skip is set or the library is unknown', () => {
        renderWatchHook({skip: true});
        expect(subscriptionSpy).toHaveBeenLastCalledWith(expect.objectContaining({skip: true}));

        renderWatchHook({libraryId: ''});
        expect(subscriptionSpy).toHaveBeenLastCalledWith(expect.objectContaining({skip: true}));
    });

    it('keeps flushing after a callback rejection', async () => {
        // the refetch triggered by another user's action fails once (transient network error)
        const failingOnListContentMaybeChanged = vi
            .fn()
            .mockRejectedValueOnce(new Error('network error'))
            .mockResolvedValue(undefined);
        renderWatchHook({onListContentMaybeChanged: failingOnListContentMaybeChanged});

        fireEvent('unlisted-a', [ACTIVE_ATTRIBUTE_ID]);
        await waitFor(() => expect(failingOnListContentMaybeChanged).toHaveBeenCalledTimes(1));

        // a later event still flushes: the rejection was swallowed, nothing is broken
        fireEvent('unlisted-b', [ACTIVE_ATTRIBUTE_ID]);
        await waitFor(() => expect(failingOnListContentMaybeChanged).toHaveBeenCalledTimes(2));
    });
});
