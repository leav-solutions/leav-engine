// .../thread-actions/__tests__/useUpdateStatus.spec.ts
import {renderHook, act} from '_ui/_tests/testUtils';
import {useUpdateStatus} from '../useUpdateStatus';
import * as callbacksHook from '../../../../stores/threadActionCallbacks';

const saveValueBatchMutationMock = jest.fn().mockResolvedValue({});

jest.mock('_ui/_gqlTypes', () => ({
    ...jest.requireActual('_ui/_gqlTypes'),
    useSaveValueBatchMutation: () => [saveValueBatchMutationMock],
}));

describe('useUpdateStatus thread-action callback', () => {
    const onDiscussionStatusChanged = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(callbacksHook, 'getThreadActionCallbacks').mockReturnValue({onDiscussionStatusChanged});
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
