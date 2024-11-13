import {useGetAttributesByLibQuery} from '_ui/_gqlTypes';
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue/useDebouncedValue';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInput, KitTypography} from 'aristid-ds';
import {FunctionComponent, useMemo, useState} from 'react';
import styled from 'styled-components';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '../../../hooks';
import {FaGripLines} from 'react-icons/fa';
import {ColumnItem} from './ColumnItem';

const StyledList = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
    color: var(--general-utilities-text-primary);
`;

const StyledDivider = styled.li`
    list-style: none;
    border-bottom: 1px solid var(--general-utilities-main-light);
    margin: 0 calc(var(--general-spacing-s) * 1px);
`;

interface IDisplayModeTableProps {
    library: string;
}

export const DisplayModeTable: FunctionComponent<IDisplayModeTableProps> = ({library}) => {
    const {t} = useSharedTranslation();
    const {lang: availableLangs} = useLang();
    // TOTO Where to stock visible columns list
    // TODO when are changes saved (and thus, when is the table updated) ?
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        id: true
    });
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebouncedValue(searchInput, 300);
    const {data} = useGetAttributesByLibQuery({
        variables: {
            library
        }
    });

    const filteredColumns = useMemo(() => {
        if (!data) {
            return [];
        }
        if (searchInput === '') {
            return data?.attributes?.list ?? [];
        }

        return data?.attributes?.list?.filter(attribute => attribute.id.includes(debouncedSearchInput)) ?? [];
    }, [debouncedSearchInput, data]);

    const _onSearchChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 2 || event.target.value.length === 0) {
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
            <KitInput placeholder={String(t('global.search'))} onChange={_onSearchChanged}></KitInput>
            <div>
                <StyledList>
                    <ColumnItem title={t('record_edition.whoAmI')} visible={false} disabled />
                    {Object.keys(visibleColumns).map(column => {
                        const attribute = filteredColumns.find(({id}) => id === column);
                        if (attribute && visibleColumns[attribute.id]) {
                            return (
                                <ColumnItem
                                    key={column}
                                    title={localizedTranslation(attribute.label, availableLangs)}
                                    visible
                                    onVisibilityClick={_toggleColumnVisibility(column)}
                                    dragHandler={<FaGripLines />}
                                />
                            );
                        }
                        return null;
                    })}
                </StyledList>
                <StyledDivider />
                <StyledList>
                    {filteredColumns.map(attribute => {
                        if (visibleColumns[attribute.id]) {
                            return null;
                        }
                        return (
                            <ColumnItem
                                key={attribute.id}
                                visible={false}
                                title={localizedTranslation(attribute.label, availableLangs)}
                                onVisibilityClick={_toggleColumnVisibility(attribute.id)}
                            />
                        );
                    })}
                </StyledList>
            </div>
        </div>
    );
};
