// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type StoreObject} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import ConfirmedButton from 'components/shared/ConfirmedButton';
import DeleteButton from 'components/shared/DeleteButton';
import useLang from 'hooks/useLang';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from 'utils';
import {type GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {useDeleteApplicationMutation} from '_gqlTypes';

interface IDeleteApplicationProps {
    application?: GET_APPLICATIONS_applications_list;
}

const DeleteApplication = ({application}: IDeleteApplicationProps): JSX.Element => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [deleteAttr] = useDeleteApplicationMutation({
        onError: () => undefined,
        update: (cache, {data: {deleteApplication}}) => {
            deleteFromCache(cache, deleteApplication as unknown as StoreObject);
        },
    });

    const onDelete = async () =>
        deleteAttr({
            variables: {appId: application.id},
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
