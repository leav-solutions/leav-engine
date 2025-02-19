// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetRecordValuesQuery} from '../../../../hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {IRecordIdentityWhoAmI} from '../../../../types/records';
import {KitAlert, KitButton, KitEmpty, KitError, KitSkeleton, KitTabs} from 'aristid-ds';
import {RecordInformations} from './RecordInformations/RecordInformations';
import {FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRotateRight} from '@fortawesome/free-solid-svg-icons';

interface IRecordSummaryProps {
    record: IRecordIdentityWhoAmI | null;
}

export const RecordSummary: FunctionComponent<IRecordSummaryProps> = ({record}) => {
    const {t} = useSharedTranslation();
    const {loading, error, data, refetch} = useGetRecordValuesQuery(
        record?.library?.id,
        ['created_at', 'created_by', 'modified_at', 'modified_by'],
        [record?.id]
    );

    if (loading) {
        return (
            <span data-testid="record-summary-skeleton">
                <KitSkeleton.KitItemCardSkeleton />
            </span>
        );
    }

    if (error) {
        return (
            <>
                <KitAlert
                    type="error"
                    message={t('record_summary.error.title')}
                    description={t('record_summary.error.description')}
                    details={error.message}
                    customContent={
                        record?.id && (
                            <KitButton
                                onClick={() => refetch([record?.id])}
                                type="action"
                                icon={<FontAwesomeIcon icon={faRotateRight} />}
                                danger
                            >
                                {t('record_summary.error.refresh')}
                            </KitButton>
                        )
                    }
                />
                <KitEmpty image={KitEmpty.ASSET_TASKS_ERROR} />
            </>
        );
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
