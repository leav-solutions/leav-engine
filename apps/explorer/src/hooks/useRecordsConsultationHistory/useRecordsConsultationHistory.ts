// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../_gqlTypes/SAVE_USER_DATA';

const RECORDS_CONSULTATION_KEY = 'records_consultation';
const HISTORY_LENGTH = 10;

export default async function (libraryId: string | null, recordId: string | null) {
    const historyKey = `${RECORDS_CONSULTATION_KEY}_${libraryId}`;
    const [updatingRecordsConsultationMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
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
