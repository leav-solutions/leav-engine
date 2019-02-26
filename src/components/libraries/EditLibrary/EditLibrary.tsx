import {History} from 'history';
import {i18n} from 'i18next';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {getLibsQuery, LibrariesQuery} from '../../../queries/libraries/getLibrariesQuery';
import {SaveLibMutation, saveLibQuery} from '../../../queries/libraries/saveLibMutation';
import {getSysTranslationQueryLanguage} from '../../../utils/utils';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import Loading from '../../shared/Loading';
import EditLibraryForm from '../EditLibraryForm';

interface IEditLibraryProps extends WithNamespaces {
    match: any;
    history: History;
    i18n: i18n;
}

class EditLibrary extends React.Component<IEditLibraryProps> {
    constructor(props: IEditLibraryProps) {
        super(props);
    }

    public render() {
        const {match, i18n: i18next} = this.props;

        const libraryId = match.params.id;
        const lang = getSysTranslationQueryLanguage(i18next);

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

                    return this._getEditLibraryForm(libToEdit);
                }}
            </LibrariesQuery>
        ) : (
            this._getEditLibraryForm(null)
        );
    }

    /**
     * Retrieve EditLibraryForm, wrapped by mutation component
     * @param libToEdit
     * @param history
     */
    private _getEditLibraryForm = (libToEdit: GET_LIBRARIES_libraries | null) => (
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
                                recordIdentityConf: {
                                    label: libData.recordIdentityConf.label,
                                    color: libData.recordIdentityConf.color,
                                    preview: libData.recordIdentityConf.preview
                                }
                            }
                        },
                        refetchQueries: [{query: getLibsQuery, variables: {id: libData.id}}, {query: getLibsQuery}]
                    });

                    this.props.history.replace({pathname: '/libraries/edit/' + libData.id});
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
                    />
                );
            }}
        </SaveLibMutation>
    )
}

export default withNamespaces()(EditLibrary);
