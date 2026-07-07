// .../usePostDiscussionComment/__tests__/usePostDiscussionComment.spec.ts
import {renderHook, act} from '_ui/_tests/testUtils';
import {usePostDiscussionComment} from '../usePostDiscussionComment';
import * as callbacksHook from '../../../../../stores/threadActionCallbacks';

const postCommentMutationMock = jest.fn().mockResolvedValue({});
const refetchMock = jest.fn().mockResolvedValue({});

jest.mock('../../../../../../../__generated__', () => ({
    useGetThreadQuery: () => ({refetch: refetchMock}),
    usePostDiscussionCommentMutation: () => [postCommentMutationMock],
}));
jest.mock('../../useCreateThread', () => ({useCreateThread: () => jest.fn().mockResolvedValue('thread-1')}));
jest.mock('../../../useThreadStatusOption/useThreadStatusOptions', () => ({useThreadStatusOptions: () => []}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({search: ''}),
}));

describe('usePostDiscussionComment thread-action callbacks', () => {
    const onCommentSubmitted = jest.fn();
    const onCommentMentionAdded = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(callbacksHook, 'getThreadActionCallbacks').mockReturnValue({
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
