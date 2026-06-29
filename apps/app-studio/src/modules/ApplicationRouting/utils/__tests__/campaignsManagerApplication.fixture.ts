import {type Application} from '../../types';

/**
 * Faithful snapshot of the real `campaigns_manager` app-studio config (captured 2026-06-29 via the
 * LEAV runtime MCP), assembled the way `appStudioSettings` does at runtime: workspaces from the
 * application settings + `libraryPanels`/`recordPanels` from each library's
 * `settings.applications.campaigns_manager`.
 *
 * It is the worst known case for the `application-settings` context (5 libraries, 18 panels, a
 * 3-level chain of nested explorers) and is shared by the reference-identity tests (LEAVC-948 KPI A)
 * and the one-shot CPU benchmark (KPI B).
 *
 * Two faithful deviations from the raw stored JSON, required to type it as `Application`:
 * - `isViewSettingsActive: false` is added on every `explorer` panel — the schema applies it as a
 *   parse-time default, so it is the real runtime value.
 * - `hideInSlider` and `mode` are dropped — they are not in `PanelSchema`, so they are stripped at
 *   parse time and absent from the inferred type.
 */
export const campaignsManagerApplication: Application = {
    enableViewSettings: true,
    workspaces: [
        {
            id: 'maps-management',
            icon: 'fa-layer-group',
            title: {en: 'All MAPs', fr: 'Tous les PACs'},
            type: 'library',
            libraryId: 'map',
        },
        {
            id: 'thematics-management',
            icon: 'fa-list',
            title: {en: 'Thematics', fr: 'Thématiques'},
            type: 'library',
            libraryId: 'thematics',
        },
        {
            id: 'events-management',
            icon: 'fa-calendar-days',
            title: {en: 'Events', fr: 'Evénements'},
            type: 'library',
            libraryId: 'events',
        },
        {
            id: 'requests-management',
            icon: 'fa-comments',
            title: {en: 'Requests', fr: 'Demandes'},
            type: 'library',
            libraryId: 'requests',
        },
        {
            id: 'pac-2026',
            icon: 'fa-star',
            title: {en: 'MAP 2026', fr: 'PAC 2026'},
            type: 'record',
            libraryId: 'map',
            recordId: '9986585',
        },
    ],
    libraries: {
        campaigns: {
            libraryPanels: [],
            recordPanels: [
                {
                    type: 'editionForm',
                    formId: 'edition_in_pacs_planning',
                    icon: 'fa-circle-info',
                    id: 'planning_campaigns_form',
                    name: {en: 'Campaigns Information', fr: 'Informations de la campagne'},
                },
                {
                    type: 'custom',
                    icon: 'fa-chart-line',
                    id: 'kpi-dashboard',
                    iframeSource: '/campaigns-manager/app/kpi-dashboard/campaign',
                    name: {en: 'Performances', fr: 'Performances'},
                },
                {
                    type: 'explorer',
                    actions: [],
                    attributeSource: 'requests_campaigns_id',
                    icon: 'fa-comment-dots',
                    id: 'requests',
                    libraryId: 'requests',
                    name: {en: 'Requests', fr: 'Demandes'},
                    viewId: '2345316120',
                    isViewSettingsActive: false,
                },
                {
                    type: 'custom',
                    icon: 'fa-bullseye',
                    id: 'campaignGoals',
                    iframeSource: '/campaigns-manager/app/cadrage/campaign-goals',
                    name: {en: 'Goals', fr: 'Objectifs'},
                },
                {
                    type: 'editionForm',
                    formId: 'thematics_modification',
                    id: 'thematics_form',
                    isStandalone: true,
                },
                {
                    type: 'creationForm',
                    attributeSource: 'campaigns_id_pac',
                    formId: 'creation',
                    id: 'creation_explorer',
                    isStandalone: true,
                    name: {en: 'Creation', fr: 'Creation d une campagne'},
                },
            ],
        },
        events: {
            libraryPanels: [
                {
                    type: 'explorer',
                    actions: [
                        {
                            icon: 'fa-pen',
                            label: {en: 'Edit event', fr: 'Éditer l’événement'},
                            onRowClick: true,
                            what: 'record',
                            where: 'popup',
                        },
                    ],
                    explorerProps: {
                        defaultMassActions: ['export', 'editAttribute', 'deactivate'],
                        defaultPrimaryActions: [],
                        showFilters: true,
                        showSearch: true,
                    },
                    id: 'event-list',
                    viewId: '1058815874',
                    isViewSettingsActive: false,
                },
            ],
            recordPanels: [
                {
                    type: 'editionForm',
                    formId: 'edition_in_evenements',
                    id: 'event-edition',
                },
            ],
        },
        map: {
            libraryPanels: [
                {
                    type: 'explorer',
                    actions: [
                        {
                            icon: 'fa-folder-open',
                            label: {en: 'Open MAP', fr: 'Ouvrir le PAC'},
                            onRowClick: true,
                            what: 'record',
                            where: 'fullpage',
                        },
                        {
                            icon: 'fa-pen',
                            label: {en: 'Edit MAP', fr: 'Editer le PAC'},
                            onRowClick: false,
                            what: 'record',
                            where: 'slider',
                        },
                    ],
                    explorerProps: {showFilters: true, showSearch: true},
                    id: 'map-list',
                    viewId: '2345316119',
                    isViewSettingsActive: false,
                },
            ],
            recordPanels: [
                {
                    type: 'custom',
                    hideInCompactMode: true,
                    icon: 'fa-timeline',
                    id: 'planning',
                    iframeSource: '/campaigns-manager/app/planning',
                    name: {en: 'Planning Management', fr: 'Planning'},
                    viewId: '2218789874',
                },
                {
                    type: 'editionForm',
                    formId: 'edition_in_pacs',
                    icon: 'fa-circle-info',
                    id: 'mapEdition',
                    isStandalone: false,
                    name: {en: 'MAP informations', fr: 'Informations du PAC'},
                },
                {
                    type: 'explorer',
                    actions: [
                        {
                            icon: 'fa-folder-open',
                            label: {en: 'Open campaign', fr: 'Ouvrir la campagne'},
                            onRowClick: true,
                            what: 'record',
                            where: 'popup',
                        },
                    ],
                    attributeSource: 'campaigns_id_pac',
                    deactivateOnUnlink: true,
                    explorerProps: {
                        defaultMassActions: ['export', 'editAttribute'],
                        showFilters: true,
                        showSearch: true,
                    },
                    hideInCompactMode: true,
                    icon: 'fa-table-list',
                    id: 'campaigns',
                    libraryId: 'campaigns',
                    name: {en: 'Campaigns', fr: 'Campagnes'},
                    viewId: '2345316100',
                    isViewSettingsActive: false,
                },
                {
                    type: 'custom',
                    hideInCompactMode: true,
                    icon: 'fa-bullseye',
                    id: 'campaignsGoals',
                    iframeSource: '/campaigns-manager/app/cadrage/campaigns-goals',
                    name: {en: 'Goals per Campaigns', fr: 'Objectifs par campagne'},
                    viewId: '2218789874',
                },
                {
                    type: 'custom',
                    hideInCompactMode: true,
                    icon: 'fa-bullseye',
                    id: 'pacGoals',
                    iframeSource: '/campaigns-manager/app/cadrage/pac-goals',
                    name: {en: 'MAP goals', fr: 'Objectifs du PAC'},
                },
            ],
        },
        requests: {
            libraryPanels: [
                {
                    type: 'explorer',
                    actions: [
                        {
                            icon: 'fa-pen',
                            label: {en: 'Edit Request', fr: 'Éditer la demande'},
                            onRowClick: true,
                            what: 'record',
                            where: 'slider',
                        },
                    ],
                    explorerProps: {
                        defaultMassActions: ['export', 'editAttribute', 'deactivate'],
                        defaultPrimaryActions: [],
                        showFilters: true,
                        showSearch: true,
                    },
                    id: 'request-list',
                    viewId: '2211590635',
                    isViewSettingsActive: false,
                },
            ],
            recordPanels: [
                {
                    type: 'editionForm',
                    formId: 'edition_in_workspace',
                    id: 'request-edition',
                },
            ],
        },
        thematics: {
            libraryPanels: [
                {
                    type: 'explorer',
                    actions: [
                        {
                            icon: 'fa-pen',
                            label: {en: 'Edit thematic', fr: 'Éditer la thématique'},
                            onRowClick: true,
                            what: 'record',
                            where: 'slider',
                        },
                    ],
                    explorerProps: {
                        defaultMassActions: ['export', 'editAttribute'],
                        showFilters: true,
                        showSearch: true,
                    },
                    id: 'thematic-list',
                    viewId: '9956766',
                    isViewSettingsActive: false,
                },
            ],
            recordPanels: [
                {
                    type: 'editionForm',
                    formId: 'edition_in_thematics',
                    id: 'thematic-edition',
                },
            ],
        },
    },
};
