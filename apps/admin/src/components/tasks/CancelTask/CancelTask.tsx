// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import useUserData from '../../../hooks/useUserData';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import CancelButton from '../../shared/CancelButton';
import useLang from 'hooks/useLang';
import {localizedTranslation} from '@leav/utils';

interface ICancelTaskProps {
    task: GET_TASKS_tasks_list;
    onCancel: (taskId: string) => void;
}

const CancelTask = ({task, onCancel}: ICancelTaskProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();
    const lang = useLang().lang;

    return userData.permissions[PermissionsActions.admin_cancel_task] ? (
        <ConfirmedButton
            action={() => onCancel(task.id)}
            confirmMessage={t('tasks.confirm_cancel', {taskName: localizedTranslation(task.label, lang)})}
        >
            <CancelButton disabled={false} />
        </ConfirmedButton>
    ) : null;
};

export default CancelTask;
