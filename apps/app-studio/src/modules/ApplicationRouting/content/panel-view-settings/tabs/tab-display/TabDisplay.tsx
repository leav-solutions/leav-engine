import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {KitEmpty} from 'aristid-ds';
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {ColumnsSettings} from './ColumnsSettings';
import {DisplayModeSelector} from './DisplayModeSelector';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {sanitize} from './_constants';
import {tab} from './tabDisplay.module.css';
import {type CurrentViewColumn} from '../../store-current-view/_types';

// TODO (admin): configure available attributes for columns
// TODO (display mode): wire DisplayModeSelector to view.display.type + dispatch SET_VIEW_TYPE
export const TabDisplay = ({
    canEditAdminView,
}: {
    // Admin mode (gear dropdown to configure available attributes) is out of scope for this
    // iteration (LEAVC-809). The flag is kept on the props to preserve the interface.
    canEditAdminView: boolean;
}) => {
    const {visibleColumns, invisibleColumns, isEmptyView, toggleVisibility, moveAttribute} = useCurrentView();
    const {lang} = useLang();
    const {t} = useTranslation();

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

    // TODO: Might not be necessary for admin user
    // Default (empty) state: no view to configure, so the display config is shown read-only/empty.
    if (isEmptyView) {
        return (
            <div className={tab}>
                <KitEmpty description={String(t('view_settings.empty_view'))} />
            </div>
        );
    }

    return (
        <div className={tab}>
            <DisplayModeSelector />
            <ColumnsSettings
                search={search}
                visibleColumns={filteredVisibleColumns}
                invisibleColumns={filteredInvisibleColumns}
                onSearchChange={setSearch}
                onToggleVisibility={toggleVisibility}
                onMoveAttribute={moveAttribute}
            />
        </div>
    );
};
