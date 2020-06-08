import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Dropdown} from 'semantic-ui-react';
import {IItem} from '../../../_types/types';

interface ILibraryItemsListMenuPaginationProps {
    items?: IItem[];
    totalCount: number;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    pagination: number;
    setPagination: (pagination: number) => void;
    setModeSelection: React.Dispatch<React.SetStateAction<boolean>>;
    setSelected: React.Dispatch<React.SetStateAction<{[x: string]: boolean}>>;
}

function LibraryItemsListMenuPagination({
    items,
    totalCount,
    offset,
    pagination,
    setPagination,
    setModeSelection,
    setSelected
}: ILibraryItemsListMenuPaginationProps): JSX.Element {
    const {t} = useTranslation();

    const paginationOptions = [5, 10, 20, 50, 100];

    const offsetDisplay = totalCount > 0 ? offset + 1 : 0;
    const nextOffsetDisplay = offset + pagination > totalCount ? totalCount : offset + pagination;

    const selectAll = () => {};
    const selectVisible = () => {
        setSelected({});
        items?.map(item => setSelected(s => ({...s, [item.id]: true})));
        setModeSelection(true);
    };

    return (
        <Dropdown
            simple
            text={t('items-list-row.nb-elements', {
                nb1: offsetDisplay,
                nb2: nextOffsetDisplay,
                nbItems: totalCount
            })}
        >
            <Dropdown.Menu>
                <Dropdown.Header>
                    <div>
                        <Button onClick={selectAll}>{t('items-menu-dropdown.select-all', {nb: totalCount})}</Button>

                        <Button onClick={selectVisible}>
                            {t('items-menu-dropdown.select-visible', {nb: items?.length})}
                        </Button>
                    </div>
                </Dropdown.Header>
                <Dropdown.Header>{t('items-menu-dropdown.items-display')}</Dropdown.Header>
                {paginationOptions.map(pagOption => (
                    <Dropdown.Item
                        key={pagOption}
                        active={pagination === pagOption}
                        onClick={() => setPagination(pagOption)}
                        content={pagOption}
                    />
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default LibraryItemsListMenuPagination;
