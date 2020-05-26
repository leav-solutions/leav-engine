import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {
    Button,
    Container,
    Divider,
    Dropdown,
    Grid,
    Header,
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
    border: 1px solid #ebebeb;
    padding: 1rem 1rem 0 1rem;
    height: 100%;
`;

const whereOptions = [
    {text: 'Contain', value: 'contain'},
    {text: "Don't Contain", value: 'not-contain'},
    {text: 'Is Equal', value: 'is-equal'},
    {text: 'Begin With', value: 'begin-with'},
    {text: 'End With', value: 'end-with'},
    {text: 'Is Empty', value: 'empty'},
    {text: 'Is Not Empty', value: 'not-empty'},
    {text: 'Existing Value', value: 'exist'},
    {
        text: 'divider',
        value: 'divider',
        content: <Dropdown.Divider />,
        disabled: true
    },
    {text: 'Search In...', value: 'not-exist'}
];

interface IFilters {
    key: any;
    where: string;
    value: string;
    attribute: string;
}

function Filters({showFilters, setShowFilters, libId, libQueryName}: IFiltersProps): JSX.Element {
    const [showAttr, setShowAttr] = useState(false);
    const [attrs, setAttrs] = useState<any>([]);
    const [show, setShow] = useState(showFilters);
    const [filters, setFilters] = useState<IFilters[]>([
        {
            key: 1,
            where: 'contain',
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
                                <Header as="h5">Filters</Header>
                            </List.Item>
                            <List.Item>
                                <Button basic icon="plus" onClick={() => setShowAttr(true)} />
                            </List.Item>
                        </List>

                        <Transition.Group>
                            <Segment secondary color="green">
                                <Grid columns={3}>
                                    <Grid.Row>
                                        <Grid.Column width="4">
                                            <strong>Where</strong>
                                        </Grid.Column>
                                        <Grid.Column width="4">
                                            <strong>Label</strong>
                                        </Grid.Column>
                                        <Grid.Column>
                                            <strong>Value</strong>
                                        </Grid.Column>
                                    </Grid.Row>
                                    {filters.map(filter => (
                                        <Grid.Row key={filter.key}>
                                            <Grid.Column width="4">
                                                <Dropdown
                                                    floating
                                                    inline
                                                    defaultValue={filter.where}
                                                    options={whereOptions}
                                                />
                                            </Grid.Column>
                                            <Grid.Column width="4">{filter.attribute}</Grid.Column>
                                            <Grid.Column width="8">
                                                <Input value={filter.value} fluid />
                                            </Grid.Column>
                                        </Grid.Row>
                                    ))}
                                </Grid>
                                <Divider />
                                <Grid columns={2}>
                                    <Grid.Column>
                                        <Button negative compact onClick={() => setFilters([])}>
                                            Remove filters
                                        </Button>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Button positive compact>
                                            Apply
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
