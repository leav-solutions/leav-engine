import {type StoreObject} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import ConfirmedButton from '../../../../shared/ConfirmedButton';
import DeleteButton from '../../../../shared/DeleteButton';
import useLang from '../../../../../hooks/useLang';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from '../../../../../utils';
import {type GET_APPLICATIONS_applications_list} from '../../../../../_gqlTypes/GET_APPLICATIONS';
import {useDeleteApplicationMutation} from '../../../../../_gqlTypes';

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
