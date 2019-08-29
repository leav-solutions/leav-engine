import {useMutation, useQuery} from '@apollo/react-hooks';
import {History} from 'history';
import {i18n} from 'i18next';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {saveLibQuery} from '../../../queries/libraries/saveLibMutation';
import {GET_LIBRARIES, GET_LIBRARIESVariables, GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditLibraryForm from '../EditLibraryForm';

interface IEditLibraryProps extends WithNamespaces {
    match: any;
    history: History;
    i18n: i18n;
}

function EditLibrary({match, history}: IEditLibraryProps) {
    const libraryId = match.params.id;
    const {lang} = useLang();
    const userData = useUserData();
    const readOnly = !userData.permissions[PermissionsActions.admin_edit_library];

    const {loading, error, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
        variables: {id: libraryId, lang}
    });
    const [saveLibrary] = useMutation(saveLibQuery);

    /**
     * Retrieve EditLibraryForm, wrapped by mutation component
     * @param libToEdit
     * @param history
     */
    const _getEditLibraryForm = (libToEdit: GET_LIBRARIES_libraries_list | null) => {
        const onFormSubmit = async libData => {
            await saveLibrary({
                variables: {
                    libData: {
                        id: libData.id,
                        label: {
                            fr: libData.label.fr,
                            en: libData.label.en
                        },
                        recordIdentityConf:
                            libData.recordIdentityConf !== null
                                ? {
                                      label: libData.recordIdentityConf.label,
                                      preview: libData.recordIdentityConf.preview,
                                      color: libData.recordIdentityConf.color
                                  }
                                : null
                    }
                },
                refetchQueries: [{query: getLibsQuery, variables: {id: libData.id}}, {query: getLibsQuery}]
            });

            history.replace({pathname: '/libraries/edit/' + libData.id});
        };

        const onPermissionsFormSubmit = async libData => {
            await saveLibrary({
                variables: {
                    libData: {
                        id: libData.id,
                        permissions_conf: {
                            permissionTreeAttributes: libData.permissions_conf.permissionTreeAttributes,
                            relation: libData.permissions_conf.relation
                        }
                    }
                },
                refetchQueries: [{query: getLibsQuery, variables: {id: libData.id}}]
            });
        };
        return (
            <EditLibraryForm
                library={libToEdit}
                onSubmit={onFormSubmit}
                onPermsSettingsSubmit={onPermissionsFormSubmit}
                readOnly={readOnly}
            />
        );
    };

    if (!libraryId) {
        return _getEditLibraryForm(null);
    }

    if (loading) {
        return <Loading />;
    }

    if (typeof error !== 'undefined') {
        return <p>Error: {error.message}</p>;
    }

    if (!data || !data.libraries || !data.libraries.list.length) {
        return <p>Unknown library</p>;
    }

    return _getEditLibraryForm(data.libraries.list[0]);
}

export default withNamespaces()(EditLibrary);
