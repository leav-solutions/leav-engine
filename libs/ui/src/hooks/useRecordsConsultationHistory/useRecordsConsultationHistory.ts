import {useEffect} from 'react';
import {useGetUserDataQuery, useSaveUserDataMutation} from '_ui/_gqlTypes';

const RECORDS_CONSULTATION_KEY = 'records_consultation';
const HISTORY_LENGTH = 10;

export default function (libraryId: string | null, recordId: string | null) {
    const historyKey = `${RECORDS_CONSULTATION_KEY}_${libraryId}`;
    const [updatingRecordsConsultationMutation] = useSaveUserDataMutation();

    const {data} = useGetUserDataQuery({
        skip: !libraryId || !recordId,
        variables: {keys: [historyKey]},
    });

    useEffect(() => {
        const _updateRecordsConsultation = async () => {
            const storedHistory = data?.userData?.data?.[historyKey] ?? [];
            const history = [...storedHistory];

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
                    global: false,
                },
            });
        };

        if (!recordId || !data?.userData?.data) {
            return;
        }

        _updateRecordsConsultation();
    }, [data, historyKey, recordId, updatingRecordsConsultationMutation]);
}
