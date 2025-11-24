// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSaveValueBatchMutation} from '_ui/_gqlTypes';
import {THREAD_STATUS_ATTIBUTE_ID, THREADS_LIBRARY_ID} from '../threadConstants';
import {useState} from 'react';

interface IUpdateStatus {
    threadId: string;
    threadStatusId: string | undefined;
}

const library = THREADS_LIBRARY_ID;

export const useUpdateStatus = ({threadId, threadStatusId}: IUpdateStatus) => {
    const [saveValueBatchMutation] = useSaveValueBatchMutation();
    const [status, setStatus] = useState(threadStatusId);

    const updateStatus = async (newStatusId: string) => {
        const values = [{attribute: THREAD_STATUS_ATTIBUTE_ID, payload: newStatusId, id_value: null}];
        await saveValueBatchMutation({variables: {library, recordId: threadId, values}});
        setStatus(newStatusId);
    };

    return {
        status,
        updateStatus,
    };
};
