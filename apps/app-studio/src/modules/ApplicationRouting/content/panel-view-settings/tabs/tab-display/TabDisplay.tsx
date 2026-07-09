import {useContext, useMemo, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useLang, usePanelIFrameHandlers} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {ColumnsSettings} from './ColumnsSettings';
import {DisplayModeSelector} from './DisplayModeSelector';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {CurrentViewContext} from '../../store-current-view/CurrentViewContext';
import {useDelegatedDisplayIframeSource} from './useDelegatedDisplayIframeSource';
import {useSyncViewToIframe} from '../../../panel-custom/message-handlers/useSyncViewToIframe';
import {sanitize} from './_constants';
import {tab} from './tabDisplay.module.css';
import {type CurrentViewColumn} from '../../store-current-view/_types';

// TODO (display mode): wire DisplayModeSelector to view.display.type + dispatch SET_VIEW_TYPE
export const TabDisplay = () => {
    const {visibleColumns, invisibleColumns, toggleVisibility, moveAttribute} = useCurrentView();
    const {lang} = useLang();

    // A custom view (origin set) delegates its display config to the panel's own iframe: it owns the
    // display mode and its settings — app-studio never renders columns or a timeline for it. An
    // explorer view (no origin) keeps the native display tab below (source resolves to undefined).
    const displayViewSettingsIframeSource = useDelegatedDisplayIframeSource();
    const {panelId, recordPanelId} = useParams();

    // Host → delegated volet iframe sync: this display-settings iframe (e.g. planning's configureViewV2)
    // needs the hub's serialized view both at mount AND on every later change (volet edit, RESET, view
    // selection) — otherwise its controls (e.g. the "show events" switch, display-mode tiles) stay stale
    // after a reset. Two complementary pushes, same `pushViewSettingsUpdate` targeting this frame:
    //  - `onRequestCurrentView`: answers the iframe's mount handshake (it pulls once its listener is
    //    ready), covering the mount race the change-driven push would lose.
    //  - `useSyncViewToIframe` (below): re-pushes whenever the hub's serialized view changes, deduped by
    //    content, mirroring what the main custom-panel iframe already gets in `PanelCustom`.
    // We still intentionally do NOT register `onUpdateView` here: the upstream edit path flows through the
    // main panel iframe (broadcast `message-to-panel` → main frame → `update-view`), so leaving
    // `update-view` unhandled for this frame stays a no-op.
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const {serializedView} = useContext(CurrentViewContext);
    const targetPanelId = recordPanelId ?? panelId;
    const {pushViewSettingsUpdate} = usePanelIFrameHandlers(iframeRef, {
        onRequestCurrentView: () => {
            if (serializedView && targetPanelId) {
                pushViewSettingsUpdate({targetPanelId, serializedView});
            }
        },
    });
    useSyncViewToIframe(pushViewSettingsUpdate);

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

    // Custom view: delegate the whole Display tab to the panel's config iframe (MVP: may be a stub).
    if (displayViewSettingsIframeSource) {
        return (
            <div className={tab}>
                <iframe
                    ref={iframeRef}
                    src={displayViewSettingsIframeSource}
                    title="view-display-settings"
                    width="100%"
                    height="100%"
                    style={{border: 'none'}}
                />
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
