import {type Application} from '../types';
import {buildTreeWorkspacePanel, isTreeWorkspace} from './treeWorkspacePanel';

type Panel = Application['libraries'][string]['libraryPanels'][number];
type PanelType = 'libraryPanels' | 'recordPanels' | 'creationPanels';
type PanelLocation = {currentPanel: Panel; libraryId: string | null; panelType: PanelType | null};
type PanelIndex = Map<string, PanelLocation>;

/**
 * Memoized flat index `panelId → {currentPanel, libraryId, panelType}`, keyed by the `application`
 * reference. Built once per reference (the O(N panels) traversal), then reused for O(1) lookups across
 * the ~10 render call sites. A new `application` reference gets a fresh entry and the old one is
 * garbage-collected with it — hence the WeakMap, no manual invalidation needed.
 *
 * Relies on panel IDs being unique across every library, which `checkPanelIdsUniqueness`
 * (schemaValidators.ts) guarantees at config-load time.
 */
const panelIndexCache = new WeakMap<Application, PanelIndex>();

const buildPanelIndex = (application: Application): PanelIndex => {
    const index: PanelIndex = new Map();

    for (const [libraryId, {libraryPanels, recordPanels, creationPanels}] of Object.entries(application.libraries)) {
        for (const currentPanel of libraryPanels) {
            index.set(currentPanel.id, {currentPanel, libraryId, panelType: 'libraryPanels'});
        }
        for (const currentPanel of recordPanels) {
            index.set(currentPanel.id, {currentPanel, libraryId, panelType: 'recordPanels'});
        }
        for (const currentPanel of creationPanels ?? []) {
            index.set(currentPanel.id, {currentPanel, libraryId, panelType: 'creationPanels'});
        }
    }

    // Tree workspaces are not backed by a library: index their single implicit `treeExplorer` panel.
    for (const workspace of application.workspaces) {
        if (isTreeWorkspace(workspace)) {
            const currentPanel = buildTreeWorkspacePanel(workspace);
            index.set(currentPanel.id, {currentPanel, libraryId: null, panelType: null});
        }
    }

    return index;
};

export const getPanelIndex = (application: Application): PanelIndex => {
    const cachedIndex = panelIndexCache.get(application);
    if (cachedIndex) {
        return cachedIndex;
    }

    const index = buildPanelIndex(application);
    panelIndexCache.set(application, index);
    return index;
};

export const retrievePanelDetails = ({
    application,
    recordPanelId,
    panelId,
}: {
    application: Application;
    panelId?: string;
    recordPanelId?: string;
}) => {
    const targetPanelId = recordPanelId ?? panelId;
    const {currentPanel, libraryId, panelType} =
        (targetPanelId === undefined ? undefined : getPanelIndex(application).get(targetPanelId)) ??
        ({currentPanel: null, libraryId: null, panelType: null} as const);

    // The library whose VIEWS the explorer shows. For a record-panel link explorer this is the linked
    // library carried on the panel (`panel.libraryId`), NOT the owner library under which the panel is
    // configured (`libraryId`, e.g. the parent record's library). For a library panel both coincide.
    // For a custom panel hosting the view-settings volet, it is the panel's static `viewLibraryId`
    // (config, stable across the volet lifecycle) if set, else the transient runtime `targetLibraryId`,
    // else the owner `libraryId`. The static field takes precedence so the displayed library does not
    // flip when the volet closes (which resets `targetLibraryId` to undefined).
    const displayedLibraryId =
        currentPanel?.type === 'explorer' && 'attributeSource' in currentPanel
            ? currentPanel.libraryId
            : currentPanel?.type === 'custom'
              ? (currentPanel.viewLibraryId ?? currentPanel.targetLibraryId ?? libraryId)
              : libraryId;

    return {currentPanel, libraryId, panelType, displayedLibraryId};
};
