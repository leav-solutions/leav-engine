import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, {useEffect} from 'react';
import {Header} from 'semantic-ui-react';

function Home(): JSX.Element {
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
        console.log(loading, data);
    }, [loading, error, data]);

    return (
        <div>
            <Header>Home</Header>
        </div>
    );
}

export default Home;
