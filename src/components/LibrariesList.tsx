import * as React from 'react';
import {Link} from 'react-router-dom';
import {List} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from '../_types/GET_LIBRARIES';

interface ILibrariesListProps {
    libraries: Array<GET_LIBRARIES_libraries | null> | null;
}

function LibrariesList({libraries}: ILibrariesListProps): JSX.Element {
    return (
        <List divided relaxed>
            {libraries === null ? (
                <p>No Libraries</p>
            ) : (
                libraries.map((l: GET_LIBRARIES_libraries) => {
                    const label = l.label !== null ? l.label.fr || l.label.en : l.id;
                    return (
                        <List.Item as={Link} to="/libraries" key={l.id}>
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
