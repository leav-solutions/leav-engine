import {localizedTranslation} from '@leav/utils';
import {RecordFilterCondition, useGetRecordInformationQuery} from '../../../../../../__generated__';
import {useLang} from '_ui/hooks';
import {ATTRIBUTE_ID} from '../../../../../../constants';

export const useGetRecordInformation = ({recordId, libraryId}: {recordId: string; libraryId: string}) => {
    const {lang} = useLang();

    const {data, loading, error} = useGetRecordInformationQuery({
        variables: {
            library: libraryId,
            filters: [
                {
                    field: ATTRIBUTE_ID,
                    condition: RecordFilterCondition.EQUAL,
                    value: recordId,
                },
            ],
        },
    });

    if (loading || error || !data) {
        return {
            recordInformation: null,
            loading,
            error,
        };
    }

    const recordRawData = data.records.list[0];

    const recordInformation = {
        libraryName: localizedTranslation(recordRawData.library?.label, lang),
        createdBy: {
            id: recordRawData.created_by?.[0]?.payload?.id,
            email: recordRawData.created_by?.[0]?.payload?.email?.[0]?.values?.[0]?.payload,
        },
        modifiedBy: {
            id: recordRawData.modified_by?.[0]?.payload?.id ?? null,
            email: recordRawData.modified_by?.[0]?.payload?.email?.[0]?.values?.[0]?.payload,
        },
        createdAt: recordRawData.created_at?.[0]?.payload,
        modifiedAt: recordRawData.modified_at?.[0]?.payload,
    };

    return {
        recordInformation,
        loading,
        error,
    };
};
