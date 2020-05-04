import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {Card, Container, Divider, Header} from 'semantic-ui-react';
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
    const [libSelected, setLibSelected] = useState<ILibSelected>();

    const {loading, data, error} = useQuery(getLibrariesListQuery);

    useEffect(() => {
        if (!loading) {
            setLibraries(data.libraries.list);
        }
    }, [loading, data, error]);

    if (error) {
        return <div>error</div>;
    }

    const changeLibSelected = (newLibSelected: ILibSelected) => {
        setLibSelected(newLibSelected);
    };

    return (
        <Container>
            <Header as="h2">Libraries List</Header>
            <Card.Group itemsPerRow={4}>
                {libraries.map((lib: ILibrary) => (
                    <LibraryCard key={lib.id} lib={lib} changeLibSelected={changeLibSelected} />
                ))}
            </Card.Group>

            {libSelected && (
                <>
                    <Divider />
                    <LibraryDetail libId={libSelected.id} libQueryName={libSelected.query} />
                </>
            )}
        </Container>
    );
}

export default LibrariesList;
