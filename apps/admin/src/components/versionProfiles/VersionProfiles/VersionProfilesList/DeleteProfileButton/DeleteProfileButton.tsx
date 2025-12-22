// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation, type WithTypename} from '@leav/utils';
import ConfirmedButton from 'components/shared/ConfirmedButton';
import DeleteButton from 'components/shared/DeleteButton';
import useLang from 'hooks/useLang';
import useUserData from 'hooks/useUserData';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from 'utils';
import {type DELETE_VERSION_PROFILE_deleteVersionProfile} from '_gqlTypes/DELETE_VERSION_PROFILE';
import {type GET_VERSION_PROFILES_versionProfiles_list} from '_gqlTypes/GET_VERSION_PROFILES';
import {PermissionsActions} from '_gqlTypes/globalTypes';
import {useDeleteVersionProfileMutation} from '_gqlTypes';

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
