import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Card, Divider, Header} from 'semantic-ui-react';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {ILibrary} from '../../_types/types';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';

interface ILibSelected {
    id: string;
    query: string;
}

function LibrariesList(): JSX.Element {
    const [libraries, setLibraries] = useState([]);

    const {libId, libQueryName} = useParams();

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
        <div style={{padding: '0.3rem'}}>
            <Header as="h2">Libraries List</Header>
            <Card.Group itemsPerRow={4}>
                {libraries.map((lib: ILibrary) => (
                    <LibraryCard key={lib.id} lib={lib} />
                ))}
            </Card.Group>

            {libId && libQueryName && (
                <>
                    <Divider />
                    <LibraryDetail libId={libId} libQueryName={libQueryName} />
                </>
            )}
        </div>
    );
}

export default LibrariesList;
