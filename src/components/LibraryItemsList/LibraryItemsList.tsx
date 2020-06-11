import {useLazyQuery, useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {Button, Dropdown, DropdownProps, Menu, Popup, Search} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {localizedLabel} from '../../utils';
import {IItem, IQueryFilter} from '../../_types/types';
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
    const [selected, setSelected] = useState<{[x: string]: boolean}>({});
    const [modeSelection, setModeSelection] = useState<boolean>(false);
    const [queryFilters, setQueryFilters] = useState<IQueryFilter[] | null>(null);

    const [pagination, setPagination] = useState(20);

    const [getRecord, {called, loading, data, error, client, refetch}] = useLazyQuery(
        getRecordsFromLibraryQuery(libQueryName || '', pagination, offset),
        {
            variables: {filters: queryFilters},
            errorPolicy: 'all'
        }
    );

    if (!called) {
        getRecord();
    }

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    useEffect(() => {
        if (!loading && called && data && client) {
            const itemsFromQuery = data ? data[libQueryName || ''].list : [];
            setItems(itemsFromQuery.map((i: any) => i.whoAmI) as IItem[]);
            setTotalCount(data[libQueryName]?.totalCount);

            const label = data[libQueryName]?.list[0]?.whoAmI.library.label;

            client.writeQuery({
                query: getActiveLibrary,
                data: {
                    activeLibId: libId,
                    activeLibQueryName: libQueryName,
                    activeLibName: localizedLabel(label, lang)
                }
            });
        }
    }, [loading, data, called, client, lang, libId, libQueryName]);

    useEffect(() => {
        getRecord();
    }, [offset, pagination, queryFilters, getRecord]);

    if (error) {
        return <div>error</div>;
    }

    const displayOptions = [
        {
            key: 'list',
            text: t('items_list.display-list'),
            value: 'list',
            icon: 'list layout'
        },
        {
            key: 'tile',
            text: t('items_list.display-tile'),
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
                setQueryFilters={setQueryFilters}
            />
            <div className="wrapper-page">
                <Menu style={{height: '5rem'}}>
                    {!showFilters && (
                        <>
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
                            items={items}
                            totalCount={totalCount}
                            offset={offset}
                            setOffset={setOffset}
                            pagination={pagination}
                            setModeSelection={setModeSelection}
                            setPagination={setPagination}
                            setSelected={setSelected}
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
                            <Button icon="redo" onClick={() => refetch && refetch()}></Button>
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
                        modeSelection={modeSelection}
                        setModeSelection={setModeSelection}
                        selected={selected}
                        setSelected={setSelected}
                    />
                )}

                {display === 'tile' && (
                    <ItemsTitleDisplay
                        items={items}
                        totalCount={totalCount}
                        pagination={pagination}
                        offset={offset}
                        setOffset={setOffset}
                        modeSelection={modeSelection}
                        setModeSelection={setModeSelection}
                        selected={selected}
                        setSelected={setSelected}
                    />
                )}
            </div>
        </Wrapper>
    );
}

export default LibraryItemsList;
