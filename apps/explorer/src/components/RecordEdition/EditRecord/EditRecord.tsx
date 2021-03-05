// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {useNotifications} from 'hooks/NotificationsHook/NotificationsHook';
import {getFormQuery} from 'queries/forms/getFormQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_FORM, GET_FORMVariables} from '_gqlTypes/GET_FORM';
import {IRecordIdentityWhoAmI, NotificationChannel, NotificationPriority, NotificationType} from '_types/types';
import EditRecordForm from './EditRecordForm';
import EditRecordSkeleton from './EditRecordSkeleton';

interface IEditRecordProps {
    record: IRecordIdentityWhoAmI;
}

function EditRecord({record}: IEditRecordProps): JSX.Element {
    const formId = 'edition';
    const {addNotification} = useNotifications();
    const {t} = useTranslation();

    // Get Form
    const {loading, error, data} = useQuery<GET_FORM, GET_FORMVariables>(getFormQuery, {
        variables: {
            library: record.library.id,
            formId
        },
        onError: err => {
            addNotification({
                type: NotificationType.error,
                priority: NotificationPriority.high,
                channel: NotificationChannel.passive,
                content: `${t('error.error_occured')}: ${err.message}`
            });
        }
    });

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error || !data?.forms?.list?.length) {
        return <ErrorDisplay message={error?.message ?? t('record_edition.no_form_error')} />;
    }

    return <EditRecordForm record={record} form={data.forms.list[0]} />;
}

export default EditRecord;
