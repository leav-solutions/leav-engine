import {useDebouncedValue} from '_ui/hooks/useDebouncedValue/useDebouncedValue';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInput, KitTypography} from 'aristid-ds';
import {ChangeEvent, FunctionComponent, useMemo, useState} from 'react';
import styled from 'styled-components';
import {FaGripLines} from 'react-icons/fa';
import {ColumnItem} from './ColumnItem';
import {useGetLibraryColumns} from './useGetLibraryColumns';

const StyledList = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
    color: var(--general-utilities-text-primary);
`;

const StyledDivider = styled.hr`
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid var(--general-utilities-main-light);
    margin: 0 calc(var(--general-spacing-s) * 1px);
    padding: 0;
`;

interface IDisplayModeTableProps {
    library: string;
}

export const DisplayModeTable: FunctionComponent<IDisplayModeTableProps> = ({library}) => {
    const {t} = useSharedTranslation();
    // TODO Where to stock visible columns list
    // TODO when are changes saved (and thus, when is the table updated) ?
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        id: true
    });
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebouncedValue(searchInput, 300);

    const columnsById = useGetLibraryColumns(library);
    const visibleColumnsKeys = Object.keys(visibleColumns);

    const filteredColumns = useMemo(() => {
        const columnIds = Object.keys(columnsById);
        if (columnIds.length === 0) {
            return {};
        }
        if (searchInput === '') {
            return columnsById;
        }

        return columnIds.reduce((acc, columnId) => {
            if (columnsById[columnId].label.includes(searchInput) || columnId.includes(searchInput)) {
                acc[columnId] = columnsById[columnId];
            }
            return acc;
        }, {});
    }, [debouncedSearchInput, columnsById]);
    const filteredColumnIds = Object.keys(filteredColumns);

    const _onSearchChanged = (event: ChangeEvent<HTMLInputElement>) => {
        if ((searchInput.length > 2 && event.target.value.length < 3) || event.target.value.length === 0) {
            setSearchInput('');
        } else if (event.target.value.length > 2) {
            setSearchInput(event.target.value);
        }
    };

    const _toggleColumnVisibility = (columnId: string) => () => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };

    return (
        <div>
            <KitTypography.Title level="h4">{t('items_list.columns')}</KitTypography.Title>
            <KitInput placeholder={String(t('global.search'))} onChange={_onSearchChanged} allowClear></KitInput>
            <div>
                <StyledList>
                    <ColumnItem title={t('record_edition.whoAmI')} visible={false} disabled />
                    {visibleColumnsKeys.map(columnId => {
                        if (filteredColumns[columnId] && visibleColumns[columnId]) {
                            return (
                                <ColumnItem
                                    key={columnId}
                                    title={columnsById[columnId].label}
                                    visible
                                    onVisibilityClick={_toggleColumnVisibility(columnId)}
                                    dragHandler={<FaGripLines />}
                                />
                            );
                        }
                        return null;
                    })}
                </StyledList>
                <StyledDivider />
                <StyledList>
                    {filteredColumnIds.map(columnId => {
                        if (visibleColumns[columnId]) {
                            return null;
                        }
                        return (
                            <ColumnItem
                                key={columnsById[columnId].id}
                                visible={false}
                                title={columnsById[columnId].label}
                                onVisibilityClick={_toggleColumnVisibility(columnId)}
                            />
                        );
                    })}
                </StyledList>
            </div>
        </div>
    );
};
