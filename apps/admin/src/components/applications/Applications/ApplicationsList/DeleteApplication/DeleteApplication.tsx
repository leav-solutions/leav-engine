// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {StoreObject, useMutation} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import ConfirmedButton from 'components/shared/ConfirmedButton';
import DeleteButton from 'components/shared/DeleteButton';
import useLang from 'hooks/useLang';
import {deleteApplicationQuery} from 'queries/applications/deleteApplicationMutation';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from 'utils';
import {DELETE_APPLICATION, DELETE_APPLICATIONVariables} from '_gqlTypes/DELETE_APPLICATION';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

interface IDeleteApplicationProps {
    application?: GET_APPLICATIONS_applications_list;
}

const DeleteApplication = ({application}: IDeleteApplicationProps): JSX.Element => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [deleteAttr] = useMutation<DELETE_APPLICATION, DELETE_APPLICATIONVariables>(deleteApplicationQuery, {
        onError: () => undefined,
        update: (cache, {data: {deleteApplication}}) => {
            deleteFromCache(cache, (deleteApplication as unknown) as StoreObject);
        }
    });

    const onDelete = async () =>
        deleteAttr({
            variables: {appId: application.id}
        });

    const appLabel = localizedTranslation(application?.label, lang);

    return application ? (
        <ConfirmedButton action={onDelete} confirmMessage={t('applications.confirm_delete', {appLabel})}>
            <DeleteButton disabled={false} />
        </ConfirmedButton>
    ) : (
        <></>
    );
};

export default DeleteApplication;
