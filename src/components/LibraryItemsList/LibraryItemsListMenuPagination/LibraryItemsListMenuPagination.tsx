import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Dropdown} from 'semantic-ui-react';

interface ILibraryItemsListMenuPaginationProps {
    totalCount: number;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    pagination: number;
    setPagination: (pagination: number) => void;
    nbItems: number;
}

function LibraryItemsListMenuPagination({
    totalCount,
    offset,
    pagination,
    setPagination,
    nbItems
}: ILibraryItemsListMenuPaginationProps): JSX.Element {
    const {t} = useTranslation();
    const paginationOptions = [5, 10, 20, 50, 100];

    const offsetDisplay = totalCount > 0 ? offset + 1 : 0;
    const nextOffsetDisplay = offset + pagination > totalCount ? totalCount : offset + pagination;

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
                        <Button>{t('items-menu-dropdown.select-all', {nb: totalCount})}</Button>
                        <Button>{t('items-menu-dropdown.select-visible', {nb: totalCount})}</Button>
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
