// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetRecordValuesQuery} from '../../../../hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {IRecordIdentityWhoAmI} from '../../../../types/records';
import {ErrorDisplay} from '../../../ErrorDisplay';
import {Loading} from '../../../Loading';
import {KitTabs} from 'aristid-ds';
import {RecordInformations} from './RecordInformations/RecordInformations';
import {FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IRecordSummaryProps {
    record: IRecordIdentityWhoAmI;
}

export const RecordSummary: FunctionComponent<IRecordSummaryProps> = ({record}) => {
    const {t} = useSharedTranslation();
    const {loading, error, data} = useGetRecordValuesQuery(
        record?.library?.id,
        ['created_at', 'created_by', 'modified_at', 'modified_by'],
        [record?.id]
    );

    if (loading) {
        //TODO: In XSTREAM-1134, we will have to handle the loading state
        return <Loading />;
    }

    if (error) {
        //TODO: In XSTREAM-1134, we will have to handle the error state
        return <ErrorDisplay message={error.message} />;
    }

    const recordData = data?.[record?.id];

    return (
        <KitTabs
            items={[
                {
                    key: 'informations',
                    label: t('record_summary.informations'),
                    tabContent: <RecordInformations record={record} recordData={recordData} />
                },
                {
                    key: 'chat',
                    label: t('record_summary.chat'),
                    disabled: true
                },
                {
                    key: 'history',
                    label: t('record_summary.history'),
                    disabled: true
                }
            ]}
        />
    );
};

export default RecordSummary;
