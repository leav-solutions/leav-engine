// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    ApplicationEventFiltersInput,
    ApplicationEventTypes,
    ApplicationType,
    LibraryBehavior,
    FileType,
    ApplicationInstallStatus
} from './globalTypes';

// ====================================================
// GraphQL subscription operation: APPLICATION_EVENTS
// ====================================================

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_library_gqlNames;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_preview_file_library {
    id: string;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_preview_file {
    id: string;
    file_type: FileType;
    library: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_preview_file_library;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_preview_file | null;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_library;
    preview: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_preview | null;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon {
    id: string;
    whoAmI: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI;
}

export interface APPLICATION_EVENTS_applicationEvent_application_permissions {
    access_application: boolean;
    admin_application: boolean;
}

export interface APPLICATION_EVENTS_applicationEvent_application_install {
    status: ApplicationInstallStatus;
    lastCallResult: string | null;
}

export interface APPLICATION_EVENTS_applicationEvent_application {
    id: string;
    label: SystemTranslation;
    type: ApplicationType;
    description: SystemTranslation | null;
    endpoint: string | null;
    url: string | null;
    color: string | null;
    icon: APPLICATION_EVENTS_applicationEvent_application_icon | null;
    module: string | null;
    permissions: APPLICATION_EVENTS_applicationEvent_application_permissions;
    install: APPLICATION_EVENTS_applicationEvent_application_install | null;
    settings: JSONObject | null;
}

export interface APPLICATION_EVENTS_applicationEvent {
    type: ApplicationEventTypes;
    application: APPLICATION_EVENTS_applicationEvent_application;
}

export interface APPLICATION_EVENTS {
    applicationEvent: APPLICATION_EVENTS_applicationEvent;
}

export interface APPLICATION_EVENTSVariables {
    filters?: ApplicationEventFiltersInput | null;
}