import {History} from 'history';
import * as React from 'react';
import EditLibraryForm from 'src/components/EditLibraryForm';
import Loading from 'src/components/Loading';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import {getLibsQuery, LibrariesQuery} from '../../queries/getLibrariesQuery';
import {SaveLibMutation, saveLibQuery} from '../../queries/saveLibMutation';

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
            <LibrariesQuery query={getLibsQuery} variables={{id: libraryId}}>
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

export default EditLibrary;
