import {localizedTranslation, type WithTypename} from '@leav/utils';
import ConfirmedButton from '../../../../shared/ConfirmedButton';
import DeleteButton from '../../../../shared/DeleteButton';
import useLang from '../../../../../hooks/useLang';
import useUserData from '../../../../../hooks/useUserData';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from '../../../../../utils';
import {type DELETE_VERSION_PROFILE_deleteVersionProfile} from '../../../../../_gqlTypes/DELETE_VERSION_PROFILE';
import {type GET_VERSION_PROFILES_versionProfiles_list} from '../../../../../_gqlTypes/GET_VERSION_PROFILES';
import {PermissionsActions, useDeleteVersionProfileMutation} from '../../../../../_gqlTypes';

interface IDeleteProfileProps {
    profile?: GET_VERSION_PROFILES_versionProfiles_list;
}

const DeleteLibrary = ({profile}: IDeleteProfileProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();
    const {lang} = useLang();

    const [deleteProfile] = useDeleteVersionProfileMutation({
        update: (cache, {data: {deleteVersionProfile}}) => {
            deleteFromCache(cache, deleteVersionProfile as WithTypename<DELETE_VERSION_PROFILE_deleteVersionProfile>);
        },
    });

    const _handleDelete = async () =>
        deleteProfile({
            variables: {id: profile.id},
        });

    const profileLabel = localizedTranslation(profile.label, lang);

    return userData.permissions[PermissionsActions.admin_delete_version_profile] ? (
        <ConfirmedButton action={_handleDelete} confirmMessage={t('version_profiles.confirm_delete', {profileLabel})}>
            <DeleteButton disabled={false} />
        </ConfirmedButton>
    ) : null;
};

export default DeleteLibrary;
