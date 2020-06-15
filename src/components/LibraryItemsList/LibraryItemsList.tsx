import {useLazyQuery, useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import styled, {CSSObject} from 'styled-components';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {localizedLabel} from '../../utils';
import {IItem, IQueryFilter} from '../../_types/types';
import Filters from './Filters';
import ItemsTitleDisplay from './ItemsTitleDisplay';
import LibraryItemsListTable from './LibraryItemsListTable';
import MenuItemList from './MenuItemList';

interface IWrapperProps {
    showSide: boolean;
    style?: CSSObject;
}

const Wrapper = styled.div<IWrapperProps>`
    display: ${({showSide}) => (showSide ? 'grid' : 'inherit')};
    grid-template-columns: 25rem auto;
    grid-template-rows: 100%;
    height: 100%;
`;

function LibraryItemsList(): JSX.Element {
    const {libId, libQueryName, filterName} = useParams();

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
        getRecordsFromLibraryQuery(libQueryName || '', filterName, pagination, offset),
        {
            variables: {filters: queryFilters}
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
                    activeLibName: localizedLabel(label, lang),
                    activeLibFilterName: filterName
                }
            });
        }
    }, [loading, data, called, client, lang, libId, libQueryName, filterName]);

    useEffect(() => {
        getRecord();
    }, [offset, pagination, queryFilters, getRecord]);

    if (error) {
        return <div>error</div>;
    }

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
                <MenuItemList
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    items={items}
                    setDisplay={setDisplay}
                    totalCount={totalCount}
                    offset={offset}
                    setOffset={setOffset}
                    pagination={pagination}
                    setModeSelection={setModeSelection}
                    setPagination={setPagination}
                    setSelected={setSelected}
                    setQueryFilters={setQueryFilters}
                    refetch={refetch}
                />
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
