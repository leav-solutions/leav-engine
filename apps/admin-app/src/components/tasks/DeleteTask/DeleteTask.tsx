// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import useUserData from '../../../hooks/useUserData';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteTaskProps {
    task: GET_TASKS_tasks_list;
    onDelete: (taskId: string) => void;
}

const DeleteTask = ({task, onDelete}: IDeleteTaskProps): JSX.Element | null => {
    const userData = useUserData();

    return userData.permissions[PermissionsActions.admin_delete_task] ? (
        <DeleteButton onClick={() => onDelete(task.id)} disabled={false} />
    ) : null;
};

export default DeleteTask;
