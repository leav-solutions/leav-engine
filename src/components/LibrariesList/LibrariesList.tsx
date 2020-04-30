import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {Header} from 'semantic-ui-react';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';

interface ILibrariesListProps {}

interface ILibrary {
    id: string;
    label: {
        [x: string]: string;
    };
}

function LibrariesList({}: ILibrariesListProps): JSX.Element {
    const [libraries, setLibraries] = useState([]);
    const {loading, data, error} = useQuery(getLibrariesListQuery);

    useEffect(() => {
        if (!loading) {
            setLibraries(data.libraries.list);
        }
    }, [loading, data, error]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <div>
            <Header as="h2">Libraries List</Header>
            <ul>
                {libraries.map((lib: ILibrary) => (
                    <li key={lib.id}>{lib.label.fr}</li>
                ))}
            </ul>
        </div>
    );
}

export default LibrariesList;
