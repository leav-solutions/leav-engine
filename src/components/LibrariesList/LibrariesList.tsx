import * as React from 'react';
import {Link} from 'react-router-dom';
import {Button, List} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';

interface ILibrariesListProps {
    libraries: GET_LIBRARIES_libraries[] | null;
    onDeleteLibrary: (libraryId: string) => void;
}

function LibrariesList({libraries, onDeleteLibrary}: ILibrariesListProps): JSX.Element {
    return (
        <List divided relaxed>
            {libraries === null ? (
                <p>No Libraries</p>
            ) : (
                libraries.map((l: GET_LIBRARIES_libraries) => {
                    const label = l.label !== null ? l.label.fr || l.label.en : l.id;
                    return (
                        <List.Item as={Link} to={'/edit-library/' + l.id} key={l.id}>
                            {!l.system && (
                                <List.Content floated="right">
                                    <Button className="delete" circular icon="trash" />
                                </List.Content>
                            )}
                            <List.Icon name="book" size="large" />
                            <List.Content>
                                <List.Header size="huge">{label}</List.Header>
                                <List.Description>{l.id}</List.Description>
                            </List.Content>
                        </List.Item>
                    );
                })
            )}
        </List>
    );
}

export default LibrariesList;
