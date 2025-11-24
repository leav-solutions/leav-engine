// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IRecordIdentityWhoAmI} from '_ui/types';
import {KitButton, KitSpace, KitTypography} from 'aristid-ds';
import {type FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import {ShowMore} from '../ShowMore';
import {useFetchRecordHistory} from './hooks/useFetchRecordHistory';
import {RecordHistoryGoUpButton} from './RecordHistoryGoUpButton';
import {RecordHistoryLogEntry} from './RecordHistoryLogEntry';

interface IRecordHistoryProps {
    record: IRecordIdentityWhoAmI;
    attributeId?: string;
}

const StyledDivContentWrapper = styled.div`
    margin-top: calc(var(--general-spacing-xs) * 1px);
    flex: 1 1 0;
    overflow-y: auto;
`;

// TODO: This component should be moved to /apps/app-studio/src/modules/information-and-history/record-history/ when he will no longer be used by RecordSummary and ValuesSummary (those components will be removed in the future)
// Also when component will be moved
// - put together translations with information_and_history
// - remove usage of styled-components
// - instead of a record we could receive a recordId and a libraryId directly
// - remove styling of StyledDivContentWrapper that will no longer be necessary
export const RecordHistory: FunctionComponent<IRecordHistoryProps> = ({record, attributeId}) => {
    const {t} = useSharedTranslation();
    const [showAllHistory, setShowAllHistory] = useState<boolean>(false);
    const {loading, inError, logs, total, hasMore, fetchMore} = useFetchRecordHistory({
        record: {
            id: record.id,
            libraryId: record.library.id,
        },
        attributeId,
    });

    if (loading && logs.length === 0) {
        // TODO: Add a better loading state
        return <Loading />;
    }

    if (inError) {
        //TODO: Add a better error state
        return <ErrorDisplay message={t('record_history.error_fetching')} />;
    }

    if (logs.length === 0) {
        return (
            <StyledDivContentWrapper>
                <KitTypography.Text>{t('record_history.empty_history')}</KitTypography.Text>
            </StyledDivContentWrapper>
        );
    }

    return (
        <StyledDivContentWrapper>
            <RecordHistoryGoUpButton>
                <KitSpace size="s" direction="vertical">
                    {showAllHistory && (
                        <>
                            {logs.map((logEntry, index) => (
                                <RecordHistoryLogEntry key={index} index={index} logEntry={logEntry} />
                            ))}
                            <ShowMore hasMore={hasMore} fetchMore={fetchMore} />
                        </>
                    )}
                    {!showAllHistory && <RecordHistoryLogEntry key={0} index={0} logEntry={logs[0]} />}
                    {total > 1 && (
                        <KitButton type="secondary" size="s" onClick={() => setShowAllHistory(!showAllHistory)}>
                            {showAllHistory
                                ? t('record_history.hide_history', {total})
                                : t('record_history.show_history', {total})}
                        </KitButton>
                    )}
                </KitSpace>
            </RecordHistoryGoUpButton>
        </StyledDivContentWrapper>
    );
};

export default RecordHistory;
