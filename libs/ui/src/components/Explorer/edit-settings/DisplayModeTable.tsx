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
    const [orderedVisibleColumns, setOrderedVisibleColumns] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebouncedValue(searchInput, 300);

    const {attributeDetailsById} = useGetLibraryColumns(library);

    const searchFilteredColumns = useMemo(() => {
        const columnIds = Object.keys(attributeDetailsById);
        if (columnIds.length === 0) {
            return {};
        }
        if (searchInput === '') {
            return attributeDetailsById;
        }

        return columnIds.reduce((acc, columnId) => {
            if (attributeDetailsById[columnId].label.includes(searchInput) || columnId.includes(searchInput)) {
                acc[columnId] = attributeDetailsById[columnId];
            }
            return acc;
        }, {});
    }, [debouncedSearchInput, attributeDetailsById]);
    const searchFilteredColumnsIds = Object.keys(searchFilteredColumns);

    const _onSearchChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const shouldIgnoreInputChange = event.target.value.length < 3 && searchInput.length < 3;
        if (shouldIgnoreInputChange) {
            return;
        }
        setSearchInput(() => {
            if (event.target.value.length > 2) {
                return event.target.value;
            }
            return '';
        });
    };

    const _toggleColumnVisibility = (columnId: string) => () => {
        setOrderedVisibleColumns(() => {
            if (orderedVisibleColumns.includes(columnId)) {
                return orderedVisibleColumns.filter(id => id !== columnId);
            }
            return [...orderedVisibleColumns, columnId];
        });
    };

    return (
        <div>
            <KitTypography.Title level="h4">{t('items_list.columns')}</KitTypography.Title>
            <KitInput placeholder={String(t('global.search'))} onChange={_onSearchChanged} allowClear></KitInput>
            <div>
                <StyledList>
                    <ColumnItem title={t('record_edition.whoAmI')} visible={false} disabled />
                    {orderedVisibleColumns
                        .filter(columnId => searchFilteredColumnsIds[columnId])
                        .map(columnId => (
                            <ColumnItem
                                key={columnId}
                                title={attributeDetailsById[columnId].label}
                                visible
                                onVisibilityClick={_toggleColumnVisibility(columnId)}
                                dragHandler={<FaGripLines />}
                            />
                        ))}
                </StyledList>
                <StyledDivider />
                <StyledList>
                    {searchFilteredColumnsIds
                        .filter(columnId => !orderedVisibleColumns.includes(columnId))
                        .map(columnId => (
                            <ColumnItem
                                key={attributeDetailsById[columnId].id}
                                visible={false}
                                title={attributeDetailsById[columnId].label}
                                onVisibilityClick={_toggleColumnVisibility(columnId)}
                            />
                        ))}
                </StyledList>
            </div>
        </div>
    );
};
