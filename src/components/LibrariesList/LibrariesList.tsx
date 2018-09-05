import * as React from 'react';
import {List} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';
import LibrariesListElem from '../LibrariesListElem';

interface ILibrariesListProps {
    libraries: GET_LIBRARIES_libraries[] | null;
}

function LibrariesList({libraries}: ILibrariesListProps): JSX.Element {
    return (
        <List divided relaxed>
            {libraries === null ? (
                <p>No Libraries</p>
            ) : (
                libraries.map((l: GET_LIBRARIES_libraries) => {
                    return <LibrariesListElem library={l} key={l.id} />;
                })
            )}
        </List>
    );
}

export default LibrariesList;
