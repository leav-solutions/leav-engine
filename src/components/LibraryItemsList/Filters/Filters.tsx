import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Button,
    Container,
    Divider,
    Dropdown,
    Grid,
    Header,
    Icon,
    Input,
    List,
    Menu,
    Segment,
    Sidebar,
    Transition
} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLibraryDetailQuery} from '../../../queries/libraries/getLibraryDetailQuery';
import SelectVue from '../SelectVue';

interface IFiltersProps {
    showFilters: boolean;
    setShowFilters: (showFilters: (x: boolean) => boolean) => void;
    libId: string;
    libQueryName: string;
}

const Side = styled.div`
    border-right: 1px solid #ebebeb;
    padding: 1rem 1rem 0 1rem;
    height: 100%;
`;

interface IFilters {
    key: any;
    where: string;
    value: string;
    attribute: string;
}

function Filters({showFilters, setShowFilters, libId, libQueryName}: IFiltersProps): JSX.Element {
    const {t} = useTranslation();
    const [showAttr, setShowAttr] = useState(false);
    const [attrs, setAttrs] = useState<any>([]);
    const [show, setShow] = useState(showFilters);
    const [filters, setFilters] = useState<IFilters[]>([
        {
            key: 1,
            where: 'contains',
            value: 'mon produit',
            attribute: 'ean'
        }
    ]);

    const {loading, data, error} = useQuery(getLibraryDetailQuery(libQueryName), {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loading) {
            const attributes = data?.libraries?.list[0]?.attributes;
            setAttrs(attributes);
        }
    }, [loading, data, error]);

    useEffect(() => {
        setShow(showFilters);
    }, [showFilters]);

    const whereOptions = [
        {text: t('filters.contains'), value: 'contains'},
        {text: t('filters.not-contains'), value: 'notContains'},
        {text: t('filters.equal'), value: 'equal'},
        {text: t('filters.not-equal'), value: 'notEqual'},
        {text: t('filters.begin-with'), value: 'beginWith'},
        {text: t('filters.end-with'), value: 'endWith'},
        {text: t('filters.is-empty'), value: 'empty'},
        {text: t('filters.is-not-empty'), value: 'notEmpty'},
        {text: t('filters.greater-than'), value: 'greaterThan'},
        {text: t('filters.less-than'), value: 'lessThan'},
        {text: t('filters.exist'), value: 'exist'},
        {text: t('filters.search-in'), value: ''}
    ];

    return (
        <Transition visible={show} onHide={() => setShowFilters(show => false)} animation="slide right" duration={100}>
            <Sidebar.Pushable>
                <Sidebar
                    visible={showAttr}
                    onHide={() => setShowAttr(false)}
                    animation="push"
                    width="wide"
                    direction="right"
                >
                    <Container>
                        <Button icon="close" onClick={() => setShowAttr(false)} />
                        <List>{attrs && attrs.map((att: any) => <List.Item key={att.id}>{att.id}</List.Item>)}</List>
                    </Container>
                </Sidebar>
                <Sidebar.Pusher>
                    <Side>
                        <Menu>
                            <Menu.Menu>
                                <Menu.Item>
                                    <Button icon="sidebar" onClick={() => setShow(false)} />
                                </Menu.Item>
                            </Menu.Menu>
                            <Menu.Menu position="right">
                                <Menu.Item>
                                    <SelectVue />
                                </Menu.Item>
                            </Menu.Menu>
                        </Menu>

                        <List horizontal>
                            <List.Item>
                                <Header as="h5">{t('filters.filters')}</Header>
                            </List.Item>
                            <List.Item>
                                <Button basic icon="plus" onClick={() => setShowAttr(true)} />
                            </List.Item>
                        </List>

                        <Transition.Group>
                            <Segment secondary color="green">
                                <Grid columns={3}>
                                    <Grid.Row>
                                        <Grid.Column width="1"></Grid.Column>
                                        <Grid.Column width="4">
                                            <strong>{t('filters.where')}</strong>
                                        </Grid.Column>
                                        <Grid.Column width="4">
                                            <strong>{t('filters.label')}</strong>
                                        </Grid.Column>
                                        <Grid.Column width="6">
                                            <strong>{t('filters.value')}</strong>
                                        </Grid.Column>
                                    </Grid.Row>
                                    {filters.map(filter => (
                                        <Grid.Row key={filter.key}>
                                            <Grid.Column width="1">
                                                <Icon name="remove" />
                                            </Grid.Column>

                                            <Grid.Column width="4">
                                                <Dropdown
                                                    floating
                                                    inline
                                                    defaultValue={filter.where}
                                                    options={whereOptions}
                                                />
                                            </Grid.Column>
                                            <Grid.Column width="4">{filter.attribute}</Grid.Column>
                                            <Grid.Column width="6">
                                                <Input value={filter.value} fluid />
                                            </Grid.Column>
                                        </Grid.Row>
                                    ))}
                                </Grid>
                                <Divider />
                                <Grid columns={2}>
                                    <Grid.Column>
                                        <Button negative compact onClick={() => setFilters([])}>
                                            {t('filters.remove-filters')}
                                        </Button>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Button positive compact>
                                            {t('filters.apply')}
                                        </Button>
                                    </Grid.Column>
                                </Grid>
                            </Segment>
                        </Transition.Group>
                    </Side>
                    <Transition visible={showAttr} animation="slide right" duration={100}>
                        <Segment>attr list </Segment>
                    </Transition>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        </Transition>
    );
}

export default Filters;
