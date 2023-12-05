// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {purgeRecordsMutation} from 'queries/records/purgeRecords';
import {
    getRecordsListQuery,
    IGetRecordsListQuery,
    IGetRecordsListQueryVariables,
    RecordFilterCondition
} from 'queries/records/recordsListQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Confirm, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import {PURGE_RECORDS, PURGE_RECORDSVariables} from '_gqlTypes/PURGE_RECORDS';

const Summary = styled.div`
    margin: 1rem 0;
`;

const ConfirmContent = styled.div`
    padding: 1.5rem;
    text-align: center;

    .warning {
        white-space: pre-line;
        margin-bottom: 1rem;
        color: #9f3a38;
        font-weight: bold;
        line-height: 1.2em;
        font-size: 1.2em;
    }
`;

interface IPurgeTabProps {
    library: GET_LIB_BY_ID_libraries_list | null;
    readonly: boolean;
}

function PurgeTab({library, readonly}: IPurgeTabProps): JSX.Element {
    const {t} = useTranslation();
    const {loading, error, data, refetch} = useQuery<IGetRecordsListQuery, IGetRecordsListQueryVariables>(
        getRecordsListQuery,
        {
            variables: {
                library: library.id,
                pagination: {limit: 1, offset: 0},
                filters: [{field: 'active', condition: RecordFilterCondition.EQUAL, value: 'false'}]
            }
        }
    );

    const [purgeRecords, {loading: purgeLoading, error: purgeError}] = useMutation<
        PURGE_RECORDS,
        PURGE_RECORDSVariables
    >(purgeRecordsMutation, {variables: {libraryId: library.id}});

    const [showConfirm, setShowConfirm] = React.useState(false);

    const _handleOpenConfirm = () => setShowConfirm(true);
    const _handleCloseConfirm = () => setShowConfirm(false);

    const _startPurge = async () => {
        try {
            _handleCloseConfirm();
            await purgeRecords();
            refetch();
        } catch (e) {
            // Error is handled with error variable
        }
    };

    if (loading || purgeLoading) {
        return <Loading />;
    }

    if (error || purgeError) {
        return <ErrorDisplay message={error?.message || purgeError?.message} />;
    }

    const recordsCount = data?.records?.totalCount ?? 0;

    const confirmContent = (
        <ConfirmContent>
            <div className="warning">{t('libraries.purge.warning', {interpolation: false})}</div>
            <div>{t('libraries.purge.confirm')}</div>
        </ConfirmContent>
    );

    return (
        <div>
            <Summary>{t('libraries.purge.summary', {count: recordsCount})}</Summary>
            {!!recordsCount && !readonly && (
                <Button primary onClick={_handleOpenConfirm} icon labelPosition="left">
                    <Icon name="trash alternate outline" />
                    {t('libraries.purge.launch_button')}
                </Button>
            )}
            {showConfirm && (
                <Confirm
                    open={showConfirm}
                    onCancel={_handleCloseConfirm}
                    onConfirm={_startPurge}
                    content={confirmContent}
                    cancelButton={t('admin.cancel')}
                    confirmButton={t('admin.submit')}
                />
            )}
        </div>
    );
}

export default PurgeTab;
