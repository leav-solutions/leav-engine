import {useLazyQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button, Header, Icon, Menu, Search} from 'semantic-ui-react';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {IItems} from '../../_types/types';
import LibraryItemsListMenuPagination from './LibraryItemsListMenuPagination';
import LibraryItemsListTable from './LibraryItemsListTable';

function LibraryItemsList(): JSX.Element {
    const {libQueryName} = useParams();
    const history = useHistory();

    const [items, setItems] = useState<IItems[]>();
    const [totalCount, setTotalCount] = useState<number>(0);
    const [offset, setOffset] = useState<number>(0);

    const [pagination, setPagination] = useState(20);

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
    }, [offset, pagination, getRecord]);

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
                    <LibraryItemsListMenuPagination
                        totalCount={totalCount}
                        offset={offset}
                        setOffset={setOffset}
                        pagination={pagination}
                        setPagination={setPagination}
                        nbItems={items?.length || 0}
                    />
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
            <LibraryItemsListTable
                items={items}
                totalCount={totalCount}
                pagination={pagination}
                offset={offset}
                setOffset={setOffset}
            />
        </div>
    );
}

export default LibraryItemsList;
