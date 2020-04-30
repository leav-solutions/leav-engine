import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {Container, Header} from 'semantic-ui-react';
import {getQueryFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';

function Home(): JSX.Element {
    const [files, setFiles] = useState<any>();
    const {loading, error, data} = useQuery(getQueryFromLibraryQuery('files'));

    useEffect(() => {
        if (!loading) {
            setFiles(data.files.list);
        }
    }, [loading, error, data, setFiles]);

    return (
        <div>
            <Header>Home</Header>
            <Container>{files && files.map((file: any) => <div>file</div>)}</Container>
        </div>
    );
}

export default Home;
