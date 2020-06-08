import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Container, Divider, Grid, Header, List, Menu, Segment, Sidebar, Transition} from 'semantic-ui-react';
import styled from 'styled-components';
import {IFilters, operatorFilter, whereFilter} from '../../../_types/types';
import SelectVue from '../SelectVue';
import AttributeList from './AttributeList';
import FilterItem from './FilterItem';

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

function Filters({showFilters, setShowFilters, libId, libQueryName}: IFiltersProps): JSX.Element {
    const {t} = useTranslation();
    const [showAttr, setShowAttr] = useState(false);
    const [show, setShow] = useState(showFilters);
    const [filters, setFilters] = useState<IFilters[]>([
        {
            key: 1,
            where: whereFilter.contains,
            value: '',
            attribute: 'ean',
            active: true
        }
    ]);

    useEffect(() => {
        setShow(showFilters);
    }, [showFilters]);

    const whereOptions = [
        {text: t('filters.contains'), value: whereFilter.contains},
        {text: t('filters.not-contains'), value: whereFilter.notContains},
        {text: t('filters.equal'), value: whereFilter.equal},
        {text: t('filters.not-equal'), value: whereFilter.notEqual},
        {text: t('filters.begin-with'), value: whereFilter.beginWith},
        {text: t('filters.end-with'), value: whereFilter.endWith},
        {text: t('filters.is-empty'), value: whereFilter.empty},
        {text: t('filters.is-not-empty'), value: whereFilter.notEmpty},
        {text: t('filters.greater-than'), value: whereFilter.greaterThan},
        {text: t('filters.less-than'), value: whereFilter.lessThan},
        {text: t('filters.exist'), value: whereFilter.exist},
        {text: t('filters.search-in'), value: whereFilter.searchIn}
    ];

    const operatorOptions = [
        {text: t('filters.and'), value: operatorFilter.and},
        {text: t('filters.or'), value: operatorFilter.or}
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
                        <AttributeList
                            libId={libId}
                            libQueryName={libQueryName}
                            setFilters={setFilters}
                            setShowAttr={setShowAttr}
                        />
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
                                    {filters.map(filter => (
                                        <FilterItem
                                            key={filter.key}
                                            filter={filter}
                                            whereOptions={whereOptions}
                                            operatorOptions={operatorOptions}
                                        />
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
