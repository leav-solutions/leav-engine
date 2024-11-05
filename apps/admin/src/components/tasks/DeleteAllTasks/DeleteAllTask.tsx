// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import useUserData from '../../../hooks/useUserData';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import {Button} from 'semantic-ui-react';

interface IDeleteTaskProps {
    onDeleteAll: () => void;
    confirmMessage: string;
    label: string;
}

const DeleteAllTask = ({onDeleteAll, confirmMessage, label}: IDeleteTaskProps): JSX.Element | null => {
    const userData = useUserData();

    return userData.permissions[PermissionsActions.admin_delete_task] ? (
        <ConfirmedButton action={onDeleteAll} confirmMessage={confirmMessage}>
            <Button secondary disabled={false} floated="right" size="small">
                {label}
            </Button>
        </ConfirmedButton>
    ) : null;
};

export default DeleteAllTask;
