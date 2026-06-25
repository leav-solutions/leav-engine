import {useMemo, useState} from 'react';
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {ColumnsSettings} from './ColumnsSettings';
import {DisplayModeSelector} from './DisplayModeSelector';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {sanitize} from './_constants';
import {tab} from './tabDisplay.module.css';
import {type CurrentViewColumn} from '../../store-current-view/_types';

// TODO (display mode): wire DisplayModeSelector to view.display.type + dispatch SET_VIEW_TYPE
export const TabDisplay = ({canEditAdminView}: {canEditAdminView: boolean}) => {
    const {visibleColumns, invisibleColumns, toggleVisibility, moveAttribute} = useCurrentView();
    const {lang} = useLang();

    // Search is a transient UI filter on the column lists, NOT part of the current view.
    const [search, setSearch] = useState('');

    const matchesSearch = useMemo(() => {
        const needle = sanitize(search.trim());

        return (attr: CurrentViewColumn) => {
            const label = attr.attribute.label ? localizedTranslation(attr.attribute.label, lang) : attr.attribute.id;
            return needle === '' || sanitize(label).includes(needle);
        };
    }, [search, lang]);

    const filteredVisibleColumns = useMemo(() => visibleColumns.filter(matchesSearch), [visibleColumns, matchesSearch]);

    const filteredInvisibleColumns = useMemo(
        () => invisibleColumns.filter(matchesSearch),
        [invisibleColumns, matchesSearch],
    );

    return (
        <div className={tab}>
            <DisplayModeSelector />
            <ColumnsSettings
                search={search}
                canEditAdminView={canEditAdminView}
                visibleColumns={filteredVisibleColumns}
                invisibleColumns={filteredInvisibleColumns}
                onSearchChange={setSearch}
                onToggleVisibility={toggleVisibility}
                onMoveAttribute={moveAttribute}
            />
        </div>
    );
};
