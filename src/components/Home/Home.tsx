import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, {useEffect, useState} from 'react';
import {Container, Header} from 'semantic-ui-react';

function Home(): JSX.Element {
    const [files, setFiles] = useState<any>();
    const {loading, error, data} = useQuery(gql`
        {
            files {
                list {
                    id
                    inode
                    is_directory
                    previews
                }
            }
        }
    `);

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
