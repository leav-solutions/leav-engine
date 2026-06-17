import {useGetRecordValuesQuery} from '../../../../hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {type IRecordIdentityWhoAmI} from '../../../../types/records';
import {KitAlert, KitButton, KitDivider, KitEmpty, KitSkeleton, KitTypography} from 'aristid-ds';
import {RecordInformations} from './RecordInformations/RecordInformations';
import {type FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRotateRight} from '@fortawesome/free-solid-svg-icons';
import {RecordHistory} from '../../../RecordHistory/RecordHistory';
import styled from 'styled-components';
import RecordHistoryGoUpButton from '_ui/components/RecordHistory/RecordHistoryGoUpButton';

interface IRecordSummaryProps {
    record: IRecordIdentityWhoAmI | null;
    scrollAll?: boolean;
}

const StyledDivContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

export const RecordSummary: FunctionComponent<IRecordSummaryProps> = ({record, scrollAll}) => {
    const {t} = useSharedTranslation();
    const {loading, error, data, refetch} = useGetRecordValuesQuery(
        record?.library?.id,
        ['created_at', 'created_by', 'modified_at', 'modified_by'],
        [record?.id],
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

    return (
        <StyledDivContentWrapper>
            <RecordHistoryGoUpButton disabled={!scrollAll}>
                <KitTypography.Text weight="bold">{t('record_summary.informations')}</KitTypography.Text>
                <RecordInformations record={record} recordData={data?.[record?.id]} />
                <KitDivider />
                <KitTypography.Text weight="bold">{t('record_summary.history')}</KitTypography.Text>
                {record && <RecordHistory record={record} noScroll={scrollAll} />}
            </RecordHistoryGoUpButton>
        </StyledDivContentWrapper>
    );
};

export default RecordSummary;
