import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {Container, Header} from 'semantic-ui-react';
import {getQueryFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';

function Home(): JSX.Element {
    const lib = 'ubs';
    const [items, setItems] = useState<any>();
    const {loading, error, data} = useQuery(getQueryFromLibraryQuery(lib));

    useEffect(() => {
        if (!loading) {
            setItems(data[lib].list);
        }
    }, [loading, error, data, setItems]);

    return (
        <div>
            <Header>Home</Header>
            <Container>{items && items.map((item: any) => <div key={item.id}>{item.id}</div>)}</Container>
        </div>
    );
}

export default Home;
