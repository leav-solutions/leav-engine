import gql from 'graphql-tag';
import * as React from 'react';
import {Query} from 'react-apollo';
import EditLibraryForm from '../components/EditLibraryForm';
import {SaveLibMutation, saveLibQuery} from '../queries/saveLibMutation';
import {GET_LIBRARY, GET_LIBRARYVariables} from '../_types/GET_LIBRARY';

interface IEditLibraryProps {
    match: any;
}

const libQuery = gql`
    query GET_LIBRARY($id: ID!) {
        libraries(id: $id) {
            id
            system
            label {
                fr
                en
            }
        }
    }
`;

class LibraryQuery extends Query<GET_LIBRARY, GET_LIBRARYVariables> {}

const updateFunc = (cache, {data: {saveLibrary}}) => {
    const {libraries} = cache.readQuery({query: libQuery, variables: {id: saveLibrary.id}});
    cache.writeQuery({
        query: libQuery,
        data: {libraries: libraries.concat([saveLibrary])}
    });
};

function EditLibrary({match}: IEditLibraryProps): JSX.Element {
    const libraryId = match.params.id;
    return (
        <LibraryQuery query={libQuery} variables={{id: libraryId}}>
            {({loading, error, data}) => {
                if (loading || !data) {
                    return <p>Loading</p>;
                }
                if (typeof error !== 'undefined') {
                    return <p>Error: {error.message}</p>;
                }

                return data.libraries !== null && data.libraries.length ? (
                    <SaveLibMutation mutation={saveLibQuery} update={updateFunc}>
                        {saveLibrary => {
                            const onFormSubmit = libData =>
                                saveLibrary({
                                    variables: {
                                        libData: {
                                            id: libData.id,
                                            label: {
                                                fr: libData.label.fr,
                                                en: libData.label.en
                                            }
                                        }
                                    }
                                });
                            return (
                                <EditLibraryForm
                                    library={data.libraries ? data.libraries[0] : null}
                                    onSubmit={onFormSubmit}
                                />
                            );
                        }}
                    </SaveLibMutation>
                ) : (
                    'Unknown library'
                );
            }}
        </LibraryQuery>
    );
}

export default EditLibrary;
