import {History} from 'history';
import {i18n} from 'i18next';
import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import Loading from 'src/components/shared/Loading';
import {getLibsQuery, LibrariesQuery} from 'src/queries/libraries/getLibrariesQuery';
import {SaveLibMutation, saveLibQuery} from 'src/queries/libraries/saveLibMutation';
import {getSysTranslationQueryLanguage} from 'src/utils/utils';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
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
                return <EditLibraryForm library={libToEdit} onSubmit={onFormSubmit} />;
            }}
        </SaveLibMutation>
    )
}

export default withNamespaces()(EditLibrary);
