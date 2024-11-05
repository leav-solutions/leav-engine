// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetUserDataQuery, useSaveUserDataMutation} from '_ui/_gqlTypes';

const RECORDS_CONSULTATION_KEY = 'records_consultation';
const HISTORY_LENGTH = 10;

export default async function (libraryId: string | null, recordId: string | null) {
    const historyKey = `${RECORDS_CONSULTATION_KEY}_${libraryId}`;
    const [updatingRecordsConsultationMutation] = useSaveUserDataMutation();

    useGetUserDataQuery({
        skip: !libraryId || !recordId,
        variables: {keys: [historyKey]},
        onCompleted: async data => {
            const history = data.userData.data[historyKey] ? [...data.userData.data[historyKey]] : [];

            const idx = history.indexOf(recordId);

            if (idx !== -1) {
                history.splice(idx, 1);
            } else if (history.length >= HISTORY_LENGTH) {
                history.pop();
            }

            history.unshift(recordId);

            await updatingRecordsConsultationMutation({
                variables: {
                    key: historyKey,
                    value: history,
                    global: false
                }
            });
        }
    });
}
