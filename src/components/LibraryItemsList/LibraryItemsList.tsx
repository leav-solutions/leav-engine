import {useLazyQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {Button, Dropdown, DropdownProps, Menu, Popup, Search} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {IItem} from '../../_types/types';
import Filters from './Filters';
import ItemsTitleDisplay from './ItemsTitleDisplay';
import LibraryItemsListMenuPagination from './LibraryItemsListMenuPagination';
import LibraryItemsListTable from './LibraryItemsListTable';
import SelectVue from './SelectVue';

interface IWrapperProps {
    showSide: boolean;
    style?: CSSObject;
}

const Wrapper = styled.div<IWrapperProps>`
    display: ${({showSide}) => (showSide ? 'grid' : 'inherit')};
    grid-template-columns: 25rem auto;
`;

function LibraryItemsList(): JSX.Element {
    const {t} = useTranslation();
    const {libId, libQueryName} = useParams();

    const [items, setItems] = useState<IItem[]>();
    const [totalCount, setTotalCount] = useState<number>(0);
    const [offset, setOffset] = useState<number>(0);
    const [display, setDisplay] = useState<string>('list');
    const [showFilters, setShowFilters] = useState(false);

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

    const displayOptions = [
        {
            key: 'list',
            text: 'list',
            value: 'list',
            icon: 'list layout'
        },
        {
            key: 'tile',
            text: 'tile',
            value: 'tile',
            icon: 'th large',
            default: true
        }
    ];

    const changeDisplay = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newDisplay = data.value?.toString();
        if (newDisplay) {
            setDisplay(newDisplay);
        }
    };

    return (
        <Wrapper showSide={showFilters}>
            <Filters
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                libId={libId}
                libQueryName={libQueryName}
            />
            <div className="wrapper-page">
                <Menu>
                    {!showFilters && (
                        <>
                            {' '}
                            <Menu.Item>
                                <Popup
                                    content={t('items_list.show-filter-panel')}
                                    trigger={<Button icon="sidebar" onClick={() => setShowFilters(show => !show)} />}
                                />
                            </Menu.Item>
                            <Menu.Item>
                                <SelectVue />
                            </Menu.Item>
                        </>
                    )}
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

                    <Menu.Menu position="right">
                        <Menu.Item>
                            <Button icon="plus" content={t('items_list.new')} />
                        </Menu.Item>

                        <Dropdown
                            text={t('items_list.display_type')}
                            item
                            options={displayOptions}
                            onChange={changeDisplay}
                        />

                        <Menu.Item>
                            <Button icon="redo"></Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>

                {display === 'list' && (
                    <LibraryItemsListTable
                        items={items}
                        setItems={setItems}
                        totalCount={totalCount}
                        pagination={pagination}
                        offset={offset}
                        setOffset={setOffset}
                    />
                )}

                {display === 'tile' && <ItemsTitleDisplay items={items} />}
            </div>
        </Wrapper>
    );
}

export default LibraryItemsList;
