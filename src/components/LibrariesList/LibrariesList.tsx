import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {Card, Divider, Header} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {ILibrary} from '../../_types/types';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';

const LibrariesListWrapper = styled.div`
    padding: 0.3rem;
`;

function LibrariesList(): JSX.Element {
    const {t} = useTranslation();
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
        <LibrariesListWrapper>
            <Header as="h2">{t('lib_list.header')}</Header>
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
        </LibrariesListWrapper>
    );
}

export default LibrariesList;
