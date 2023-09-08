/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationEventFiltersInput, ApplicationEventTypes, ApplicationType} from './globalTypes';

// ====================================================
// GraphQL subscription operation: APPLICATION_EVENTS
// ====================================================

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI {
    id: string;
    library: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface APPLICATION_EVENTS_applicationEvent_application_icon {
    whoAmI: APPLICATION_EVENTS_applicationEvent_application_icon_whoAmI;
}

export interface APPLICATION_EVENTS_applicationEvent_application_permissions {
    access_application: boolean;
    admin_application: boolean;
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
