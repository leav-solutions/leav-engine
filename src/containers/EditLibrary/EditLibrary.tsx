import {History} from 'history';
import * as React from 'react';
import EditLibraryForm from '../../components/EditLibraryForm';
import {getLibsQuery} from '../../queries/getLibrariesQuery';
import {getLibQuery, LibraryQuery} from '../../queries/getLibraryQuery';
import {SaveLibMutation, saveLibQuery} from '../../queries/saveLibMutation';
import {GET_LIBRARY_libraries} from '../../_gqlTypes/GET_LIBRARY';

interface IEditLibraryProps {
    match: any;
    history: History;
}

class EditLibrary extends React.Component<IEditLibraryProps> {
    constructor(props: IEditLibraryProps) {
        super(props);
    }

    public render() {
        const {match} = this.props;

        const libraryId = match.params.id;
        return libraryId ? (
            <LibraryQuery query={getLibQuery} variables={{id: libraryId}}>
                {({loading, error, data}) => {
                    if (loading) {
                        return <p>Loading...</p>;
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
            </LibraryQuery>
        ) : (
            this._getEditLibraryForm(null)
        );
    }

    /**
     * Retrieve EditLibraryForm, wrapped by mutation component
     * @param libToEdit
     * @param history
     */
    private _getEditLibraryForm = (libToEdit: GET_LIBRARY_libraries | null) => (
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
                                }
                            }
                        },
                        refetchQueries: [{query: getLibQuery, variables: {id: libData.id}}, {query: getLibsQuery}]
                    });

                    this.props.history.replace({pathname: '/edit-library/' + libData.id});
                };
                return <EditLibraryForm library={libToEdit} onSubmit={onFormSubmit} />;
            }}
        </SaveLibMutation>
    )
}

export default EditLibrary;
