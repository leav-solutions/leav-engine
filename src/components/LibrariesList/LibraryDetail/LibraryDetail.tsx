import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
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
    const {t} = useTranslation();
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

    return (
        <Segment>
            <Header as="h3">{details?.label[lang] ?? `${t('lib_detail.id')}: ${details?.id}`}</Header>

            <Divider />

            <Grid columns={3} divided>
                <Grid.Column>
                    <Header as="h4">{t('lib_detail.lib_info')}</Header>
                    <Segment>
                        {details?.totalCount ?? '0'} {t('lib_detail.elements')}
                    </Segment>
                    <Button icon="plus" content={t('lib_detail.new')} />
                </Grid.Column>

                <Grid.Column>
                    <Header as="h4">{t('lib_detail.search_saves')}</Header>
                    <Segment>
                        <NavLink to={`/library/items/${libQueryName}`}>{t('lib_detail.search_all')}</NavLink>
                    </Segment>
                    <Button icon="plus" content={t('lib_detail.add_filter')} />
                </Grid.Column>

                <Grid.Column>
                    <Header as="h4">{t('lib_detail.last_views')}</Header>
                </Grid.Column>
            </Grid>
        </Segment>
    );
}

export default LibraryDetail;
