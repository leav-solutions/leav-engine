import {useSaveValueBatchMutation} from '_ui/_gqlTypes';
import {THREAD_STATUS_ATTIBUTE_ID, THREADS_LIBRARY_ID} from '../threadConstants';
import {useState} from 'react';
import {useRouteParams} from '../../../router/useRouteParams';
import {getThreadActionCallbacks} from '../../../stores/threadActionCallbacks';

interface IUpdateStatus {
    threadId: string;
    threadStatusId: string | undefined;
}

const library = THREADS_LIBRARY_ID;

export const useUpdateStatus = ({threadId, threadStatusId}: IUpdateStatus) => {
    const [saveValueBatchMutation] = useSaveValueBatchMutation();
    const [status, setStatus] = useState(threadStatusId);
    const {where} = useRouteParams();
    const {onDiscussionStatusChanged} = getThreadActionCallbacks({where}) ?? {};

    const updateStatus = async (newStatusId: string) => {
        const values = [{attribute: THREAD_STATUS_ATTIBUTE_ID, payload: newStatusId, id_value: null}];
        await saveValueBatchMutation({variables: {library, recordId: threadId, values}});
        setStatus(newStatusId);
        onDiscussionStatusChanged?.();
    };

    return {
        status,
        updateStatus,
    };
};
