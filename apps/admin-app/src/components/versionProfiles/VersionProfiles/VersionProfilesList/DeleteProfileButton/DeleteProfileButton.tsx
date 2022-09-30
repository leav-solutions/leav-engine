// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {localizedTranslation, WithTypename} from '@leav/utils';
import ConfirmedButton from 'components/shared/ConfirmedButton';
import DeleteButton from 'components/shared/DeleteButton';
import useLang from 'hooks/useLang';
import useUserData from 'hooks/useUserData';
import {deleteVersionProfileMutation} from 'queries/versionProfiles/deleteVersionProfileMutation';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from 'utils';
import {
    DELETE_VERSION_PROFILE,
    DELETE_VERSION_PROFILEVariables,
    DELETE_VERSION_PROFILE_deleteVersionProfile
} from '_gqlTypes/DELETE_VERSION_PROFILE';
import {GET_VERSION_PROFILES_versionProfiles_list} from '_gqlTypes/GET_VERSION_PROFILES';
import {PermissionsActions} from '_gqlTypes/globalTypes';

interface IDeleteProfileProps {
    profile?: GET_VERSION_PROFILES_versionProfiles_list;
}

const DeleteLibrary = ({profile}: IDeleteProfileProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();
    const {lang} = useLang();

    const [deleteProfile] = useMutation<DELETE_VERSION_PROFILE, DELETE_VERSION_PROFILEVariables>(
        deleteVersionProfileMutation,
        {
            update: (cache, {data: {deleteVersionProfile}}) => {
                deleteFromCache(
                    cache,
                    deleteVersionProfile as WithTypename<DELETE_VERSION_PROFILE_deleteVersionProfile>
                );
            }
        }
    );

    const _handleDelete = async () =>
        deleteProfile({
            variables: {id: profile.id}
        });

    const profileLabel = localizedTranslation(profile.label, lang);

    return userData.permissions[PermissionsActions.admin_delete_version_profile] ? (
        <ConfirmedButton action={_handleDelete} confirmMessage={t('version_profiles.confirm_delete', {profileLabel})}>
            <DeleteButton disabled={false} />
        </ConfirmedButton>
    ) : null;
};

export default DeleteLibrary;
