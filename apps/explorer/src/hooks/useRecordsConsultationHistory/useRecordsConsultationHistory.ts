// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery, useMutation} from '@apollo/client';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../_gqlTypes/SAVE_USER_DATA';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';

const RECORDS_CONSULTATION_KEY = 'records_consultation';
const HISTORY_LENGTH = 10;

export default async function (libraryId: string, recordId: string) {
    const [updatingRecordsConsultationMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData, {
        refetchQueries: [
            {
                query: getUserDataQuery,
                variables: {key: `${RECORDS_CONSULTATION_KEY}_${libraryId}`}
            }
        ]
    });

    useQuery(getUserDataQuery, {
        variables: {
            key: `${RECORDS_CONSULTATION_KEY}_${libraryId}`
        },
        onCompleted: async data => {
            const history = data.userData.data ? [...data.userData.data] : [];

            const idx = history.indexOf(recordId);

            if (idx !== -1) {
                history.splice(idx, 1);
            } else if (history.length >= HISTORY_LENGTH) {
                history.pop();
            }

            history.unshift(recordId);

            await updatingRecordsConsultationMutation({
                variables: {
                    key: `${RECORDS_CONSULTATION_KEY}_${libraryId}`,
                    value: history,
                    global: false
                }
            });
        }
    });
}
