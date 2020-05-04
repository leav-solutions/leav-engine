import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Button, Divider, Grid, Header, Segment} from 'semantic-ui-react';
import {getLibraryDetailQuery} from '../../../queries/libraries/getLibraryDetailQuery';
import {ILabel} from '../../../_types/types';

interface ILibraryDetailProps {
    libId: string;
    libQueryName: string;
}

interface IDetails {
    id: string;
    system: boolean;
    label: ILabel;
    attributes: {
        id: string;
        type: string;
        format: string;
        label: ILabel;
    }[];
    totalCount: number;
}

const lang = 'en';

function LibraryDetail({libId, libQueryName}: ILibraryDetailProps): JSX.Element {
    const [details, setDetails] = useState<IDetails>();

    const {loading, data, error} = useQuery(getLibraryDetailQuery(libQueryName), {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loading) {
            const dataDetails = data?.libraries?.list[0];
            const totalCount = data[libQueryName]?.totalCount;
            setDetails({...dataDetails, totalCount});
        }
    }, [loading, data, error, libQueryName]);

    if (error) {
        return <div>error</div>;
    }

    if (!loading) {
        return (
            <Segment>
                <Header as="h3">{details?.label[lang] ?? 'Id: ' + details?.id}</Header>

                <Divider />

                <Grid columns={3} divided>
                    <Grid.Column>
                        <Header as="h4">Library Information</Header>
                        <Segment>{details?.totalCount ?? '0'} elements</Segment>
                        <Button icon="plus" content="New" />
                    </Grid.Column>

                    <Grid.Column>
                        <Header as="h4">Your search saves</Header>
                        <Segment>
                            <Link to="">Search all</Link>
                        </Segment>
                        <Button icon="plus" content="Add Filter" />
                    </Grid.Column>

                    <Grid.Column>
                        <Header as="h4">Last views</Header>
                        <Segment>blabla</Segment>
                    </Grid.Column>
                </Grid>
            </Segment>
        );
    } else {
        return <div>loading</div>;
    }
}

export default LibraryDetail;
