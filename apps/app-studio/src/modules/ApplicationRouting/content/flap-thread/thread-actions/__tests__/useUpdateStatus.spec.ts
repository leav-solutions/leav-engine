// .../thread-actions/__tests__/useUpdateStatus.spec.ts
import {renderHook, act} from '_ui/_tests/testUtils';
import {useUpdateStatus} from '../useUpdateStatus';
import * as callbacksHook from '../../../../stores/threadActionCallbacks';

const saveValueBatchMutationMock = vi.fn().mockResolvedValue({});

vi.mock('_ui/_gqlTypes', async () => ({
    ...(await vi.importActual('_ui/_gqlTypes')),
    useSaveValueBatchMutation: () => [saveValueBatchMutationMock],
}));

describe('useUpdateStatus thread-action callback', () => {
    const onDiscussionStatusChanged = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(callbacksHook, 'getThreadActionCallbacks').mockReturnValue({onDiscussionStatusChanged});
    });

    it('fires onDiscussionStatusChanged after a successful update', async () => {
        const {
            result: {current},
        } = renderHook(() => useUpdateStatus({threadId: 'thread-1', threadStatusId: 'open'}));

        await act(async () => {
            await current.updateStatus('closed');
        });

        expect(saveValueBatchMutationMock).toHaveBeenCalledTimes(1);
        expect(onDiscussionStatusChanged).toHaveBeenCalledTimes(1);
    });
});
