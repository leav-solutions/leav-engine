// .../usePostDiscussionComment/__tests__/usePostDiscussionComment.spec.ts
import {renderHook, act} from '_ui/_tests/testUtils';
import {usePostDiscussionComment} from '../usePostDiscussionComment';
import * as callbacksHook from '../../../../../stores/threadActionCallbacks';

const postCommentMutationMock = vi.fn().mockResolvedValue({});
const refetchMock = vi.fn().mockResolvedValue({});

vi.mock('../../../../../../../__generated__', () => ({
    useGetThreadQuery: () => ({refetch: refetchMock}),
    usePostDiscussionCommentMutation: () => [postCommentMutationMock],
}));
vi.mock('../../useCreateThread', () => ({useCreateThread: () => vi.fn().mockResolvedValue('thread-1')}));
vi.mock('../../../useThreadStatusOption/useThreadStatusOptions', () => ({useThreadStatusOptions: () => []}));
vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useLocation: () => ({search: ''}),
}));

describe('usePostDiscussionComment thread-action callbacks', () => {
    const onCommentSubmitted = vi.fn();
    const onCommentMentionAdded = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(callbacksHook, 'getThreadActionCallbacks').mockReturnValue({
            onCommentSubmitted,
            onCommentMentionAdded,
        });
    });

    it('fires onCommentSubmitted (and not onCommentMentionAdded) for a comment without mentions', async () => {
        const {
            result: {current},
        } = renderHook(() => usePostDiscussionComment({recordId: 'rec', libraryId: 'lib'}));

        await act(async () => {
            await current.postComment('hello', 'thread-1', []);
        });

        expect(onCommentSubmitted).toHaveBeenCalledTimes(1);
        expect(onCommentMentionAdded).not.toHaveBeenCalled();
    });

    it('also fires onCommentMentionAdded when the comment carries mentions', async () => {
        const {
            result: {current},
        } = renderHook(() => usePostDiscussionComment({recordId: 'rec', libraryId: 'lib'}));

        await act(async () => {
            await current.postComment('hi @bob', 'thread-1', ['bob']);
        });

        expect(onCommentSubmitted).toHaveBeenCalledTimes(1);
        expect(onCommentMentionAdded).toHaveBeenCalledTimes(1);
    });

    it('does not fire callbacks when the message is empty', async () => {
        const {
            result: {current},
        } = renderHook(() => usePostDiscussionComment({recordId: 'rec', libraryId: 'lib'}));

        await act(async () => {
            await current.postComment('   ', 'thread-1', []);
        });

        expect(onCommentSubmitted).not.toHaveBeenCalled();
    });
});
