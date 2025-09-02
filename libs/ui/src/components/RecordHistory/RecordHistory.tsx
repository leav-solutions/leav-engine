// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordIdentityWhoAmI} from '_ui/types';
import {KitSpace, KitTypography} from 'aristid-ds';
import {FunctionComponent} from 'react';
import styled from 'styled-components';
import {RecordHistoryLogEntry} from './RecordHistoryLogEntry';
import {useFetchRecordHistory} from './hooks/useFetchRecordHistory';
import {ErrorDisplay} from '../ErrorDisplay';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {Loading} from '../Loading';

interface IRecordHistoryProps {
    record: IRecordIdentityWhoAmI;
    attributeId?: string;
}

const StyledDivContentWrapper = styled.div`
    margin-top: calc(var(--general-spacing-s) * 1px);
`;

export const RecordHistory: FunctionComponent<IRecordHistoryProps> = ({record, attributeId}) => {
    const {t} = useSharedTranslation();
    const {loading, inError, logs} = useFetchRecordHistory({
        record: {
            id: record.id,
            libraryId: record.library.id
        },
        attributeId
    });

    if (loading) {
        return <Loading />;
    }

    if (inError) {
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
            <KitSpace size="s" direction="vertical">
                {logs.map((logEntry, index) => (
                    <RecordHistoryLogEntry key={index} index={index} logEntry={logEntry} />
                ))}
            </KitSpace>
        </StyledDivContentWrapper>
    );
};

export default RecordHistory;
