import {useLazyQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useParams} from 'react-router-dom';
import {Button, Header, Icon, Menu, Search} from 'semantic-ui-react';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {IItem} from '../../_types/types';
import LibraryItemsListMenuPagination from './LibraryItemsListMenuPagination';
import LibraryItemsListTable from './LibraryItemsListTable';

function LibraryItemsList(): JSX.Element {
    const {t} = useTranslation();
    const {libQueryName} = useParams();
    const history = useHistory();

    const [items, setItems] = useState<IItem[]>();
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
            const itemsFromQuery = data ? data[libQueryName || ''].list : [];
            setItems(itemsFromQuery.map((i: any) => i.whoAmI) as IItem[]);
            setTotalCount(data[libQueryName || ''].totalCount);
        }
    }, [loading, data, libQueryName, called]);

    useEffect(() => {
        getRecord();
    }, [offset, pagination, getRecord]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <div>
            <Menu>
                <Menu.Item>
                    <Button icon="arrow left" onClick={() => history.goBack()} />
                </Menu.Item>

                <Menu.Item>
                    <Button icon="sidebar" content={t('items_list.all_sheets')} />
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
                        <Button>{t('items_list.filters')}</Button>
                        <Button>{t('items_list.sorts')}</Button>
                        <Button>{t('items_list.groups')}</Button>
                        <Button>{t('items_list.columns')}</Button>
                    </Button.Group>
                </Menu.Item>

                <Menu.Menu position="right">
                    <Menu.Item>
                        <Button icon="plus" content={t('items_list.new')} />
                    </Menu.Item>

                    <Menu.Item>
                        <Icon name="cog" size="large" />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Header>{t('items_list.header_table', {libName: libQueryName})}</Header>
            <LibraryItemsListTable
                items={items}
                setItems={setItems}
                totalCount={totalCount}
                pagination={pagination}
                offset={offset}
                setOffset={setOffset}
            />
        </div>
    );
}

export default LibraryItemsList;
