import {useLazyQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button, Dimmer, Header, Icon, Loader, Menu, Search, Segment, Table} from 'semantic-ui-react';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {ILabel} from '../../_types/types';

interface IItems {
    id: string;
    label: ILabel;
}

function LibraryItemsList(): JSX.Element {
    const {libQueryName} = useParams();
    const history = useHistory();

    const [items, setItems] = useState<IItems[]>();
    const [totalCount, setTotalCount] = useState<number>();
    const [offset, setOffset] = useState<number>(0);

    const pagination = 20;

    const [getRecord, {called, loading, data, error}] = useLazyQuery(
        getRecordsFromLibraryQuery(libQueryName || '', pagination, offset)
    );

    if (!called) {
        getRecord();
    }

    useEffect(() => {
        if (!loading && called) {
            const itemsFromQuery: IItems[] = data ? data[libQueryName || ''].list : [];
            setItems(itemsFromQuery);
            setTotalCount(data[libQueryName || ''].totalCount);
        }
    }, [loading, data, libQueryName, called]);

    useEffect(() => {
        getRecord();
    }, [offset]);

    if (loading) {
        return (
            <Segment style={{height: '20rem'}}>
                <Dimmer active inverted>
                    <Loader inverted size="massive" />
                </Dimmer>
            </Segment>
        );
    }

    if (error) {
        return <div>ERROR</div>;
    }

    return (
        <div>
            <Menu>
                <Menu.Item>
                    <Button icon="arrow left" onClick={() => history.goBack()} />
                </Menu.Item>

                <Menu.Item>
                    <Button icon="sidebar" content="All sheets" />
                </Menu.Item>

                <Menu.Item>
                    <span>/ {totalCount} results</span>
                    <Icon name="angle down" />
                </Menu.Item>

                <Menu.Item>
                    <Search />
                </Menu.Item>

                <Menu.Item>
                    <Button.Group>
                        <Button>Filters</Button>
                        <Button>Sorts</Button>
                        <Button>Groups</Button>
                        <Button>Columns</Button>
                    </Button.Group>
                </Menu.Item>

                <Menu.Menu position="right">
                    <Menu.Item>
                        <Button icon="plus" content="New" />
                    </Menu.Item>

                    <Menu.Item>
                        <Icon name="cog" size="large" />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>

            <Header>Items from {libQueryName}</Header>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Id</Table.HeaderCell>
                        <Table.HeaderCell>label</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {items &&
                        items?.map((item: any) => (
                            <Table.Row key={item.id}>
                                <Table.Cell>{item.whoAmI?.id}</Table.Cell>
                                <Table.Cell>{item.whoAmI?.label}</Table.Cell>
                            </Table.Row>
                        ))}
                </Table.Body>
                <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell colSpan="3">
                            <Menu floated="right" pagination>
                                <Menu.Item
                                    as="a"
                                    icon
                                    onClick={() => setOffset(offset >= pagination ? offset - pagination : 0)}
                                >
                                    <Icon name="chevron left" />
                                </Menu.Item>

                                {totalCount &&
                                    [...Array(Math.round(totalCount / pagination))].map((e, index) => (
                                        <Menu.Item
                                            key={index}
                                            as="a"
                                            active={Math.round(offset / pagination) === index}
                                            onClick={() => setOffset(index * pagination)}
                                        >
                                            {index + 1}
                                        </Menu.Item>
                                    ))}

                                <Menu.Item as="a" icon onClick={() => setOffset(offset + pagination)}>
                                    <Icon name="chevron right" />
                                </Menu.Item>
                            </Menu>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        </div>
    );
}

export default LibraryItemsList;
