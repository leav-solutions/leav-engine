// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    GetRecordColumnsValuesRecord,
    IRecordColumnValueLink,
    IRecordColumnValueStandard
} from '_ui/_queries/records/getRecordColumnsValues';
import {IRecordIdentityWhoAmI} from '_ui/types';

export const useRecordInformations = (record: IRecordIdentityWhoAmI, recordData: GetRecordColumnsValuesRecord) => {
    const {t} = useSharedTranslation();

    const recordInformations = [
        {
            title: t('record_summary.id_entity'),
            value: record?.id ?? '-'
        }
    ];

    if (recordData?.created_at?.[0]) {
        recordInformations.push({
            title: t('record_summary.creation'),
            value: t('record_summary.date_by_user', {
                date: (recordData?.created_at?.[0] as IRecordColumnValueStandard).payload,
                user: (recordData?.created_by?.[0] as IRecordColumnValueLink)?.linkValue?.whoAmI?.label,
                interpolation: {escapeValue: false}
            })
        });
    }

    if (recordData?.modified_at?.[0]) {
        recordInformations.push({
            title: t('record_summary.last_modification'),
            value: t('record_summary.date_by_user', {
                date: (recordData?.modified_at?.[0] as IRecordColumnValueStandard).payload,
                user: (recordData?.modified_by?.[0] as IRecordColumnValueLink)?.linkValue?.whoAmI?.label,
                interpolation: {escapeValue: false}
            })
        });
    }

    return recordInformations;
};
