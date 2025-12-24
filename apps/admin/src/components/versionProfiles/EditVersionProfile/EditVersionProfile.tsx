// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import useLang from 'hooks/useLang';
import useUserData from 'hooks/useUserData';
import omit from 'lodash/omit';
import {getVersionProfilesQuery} from 'queries/versionProfiles/getVersionProfilesQuery';
import {useTranslation} from 'react-i18next';
import {type match, useHistory} from 'react-router-v5';
import {Divider, Header} from 'semantic-ui-react';
import styled from 'styled-components';
import {type GET_VERSION_PROFILES, type GET_VERSION_PROFILESVariables} from '_gqlTypes/GET_VERSION_PROFILES';
import {
    PermissionsActions,
    type VersionProfileInput,
    useGetVersionProfileByIdQuery,
    useSaveVersionProfileMutation,
} from '_gqlTypes';
import {type IFormError} from '_types/errors';
import InfoForm from './InfoForm';
import {type GET_VERSION_PROFILE_BY_ID_versionProfiles_list} from '_gqlTypes/GET_VERSION_PROFILE_BY_ID';

export interface IEditVersionProfileMatchParams {
    id?: string;
}

interface IEditVersionProfileProps {
    match?: match<IEditVersionProfileMatchParams>;
}

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
`;

function EditVersionProfile({match: routerMatch}: IEditVersionProfileProps): JSX.Element {
    const apolloClient = useApolloClient();
    const history = useHistory();
    const {t} = useTranslation();
    const {lang} = useLang();
    const userData = useUserData();
    const profileId = routerMatch.params?.id ?? null;
    const isNewProfile = !profileId;

    const {loading, error, data} = useGetVersionProfileByIdQuery({
        variables: {id: profileId},
        skip: isNewProfile,
    });

    const [saveVersionProfile, {loading: saveLoading, error: saveError}] = useSaveVersionProfileMutation({
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onCompleted: res => {
            if (isNewProfile) {
                // Redirect to new app editing
                history.push(`/version_profiles/edit/${res.saveVersionProfile.id}`);
            }
        },
        update: cache => {
            // We created a new profile, invalidate all version profiles list cache
            if (isNewProfile) {
                cache.evict({fieldName: 'versionProfiles'});
            }
        },
    });

    const _handleSubmit = async (profileData: VersionProfileInput) => {
        try {
            await saveVersionProfile({
                variables: {
                    versionProfile: {
                        id: profileData.id,
                        description: profileData.description,
                        label: profileData.label,
                        trees: profileData.trees,
                    },
                },
            });
        } catch (err) {
            console.error(err);
        }
    };

    const _handleCheckIdIsUnique = async (value: string): Promise<boolean> => {
        if (!value) {
            return true;
        }

        try {
            // Using apolloClient.query to be able to await query result
            const res = await apolloClient.query<GET_VERSION_PROFILES, GET_VERSION_PROFILESVariables>({
                query: getVersionProfilesQuery,
                variables: {filters: {id: value}},
                errorPolicy: 'all',
            });

            // No result means id is unique
            return !res?.data?.versionProfiles?.list.length;
        } catch (err) {
            return true;
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!isNewProfile && !data?.versionProfiles?.list.length) {
        return <ErrorDisplay message={t('version_profiles.not_found')} />;
    }

    const profile = data?.versionProfiles?.list.length ? omit(data?.versionProfiles?.list?.[0], '__typename') : null;

    const isReadOnly = !(userData?.permissions?.[PermissionsActions.admin_edit_version_profile] ?? false);
    const formErrors = error?.graphQLErrors?.length ? error.graphQLErrors[0] : null;
    const headerLabel = profile?.label ? localizedTranslation(profile.label, lang) : t('version_profiles.new');

    return (
        <>
            <Header>
                <Header.Content>{headerLabel}</Header.Content>
                <Divider />
            </Header>
            <InfoForm
                profile={profile as GET_VERSION_PROFILE_BY_ID_versionProfiles_list}
                readonly={isReadOnly}
                loading={saveLoading}
                errors={formErrors as unknown as IFormError}
                onCheckIdUniqueness={_handleCheckIdIsUnique}
                onSubmit={_handleSubmit}
            />
        </>
    );
}

export default EditVersionProfile;
