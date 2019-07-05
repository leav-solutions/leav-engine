import {History} from 'history';
import {i18n} from 'i18next';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getLibsQuery, LibrariesQuery} from '../../../queries/libraries/getLibrariesQuery';
import {SaveLibMutation, saveLibQuery} from '../../../queries/libraries/saveLibMutation';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
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

    /**
     * Retrieve EditLibraryForm, wrapped by mutation component
     * @param libToEdit
     * @param history
     */
    const _getEditLibraryForm = (libToEdit: GET_LIBRARIES_libraries | null) => (
        <SaveLibMutation mutation={saveLibQuery}>
            {saveLibrary => {
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
                                permissionsConf: {
                                    permissionTreeAttributes: libData.permissionsConf.permissionTreeAttributes,
                                    relation: libData.permissionsConf.relation
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
            }}
        </SaveLibMutation>
    );

    return libraryId ? (
        <LibrariesQuery query={getLibsQuery} variables={{id: libraryId, lang}}>
            {({loading, error, data}) => {
                if (loading) {
                    return <Loading />;
                }
                if (typeof error !== 'undefined') {
                    return <p>Error: {error.message}</p>;
                }

                if (libraryId && !data) {
                    return 'Unknown library';
                }

                const libToEdit = data!.libraries !== null && data!.libraries!.length ? data!.libraries![0] : null;

                return _getEditLibraryForm(libToEdit);
            }}
        </LibrariesQuery>
    ) : (
        _getEditLibraryForm(null)
    );
}

export default withNamespaces()(EditLibrary);
