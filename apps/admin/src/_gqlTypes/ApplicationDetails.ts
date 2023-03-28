// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationType} from './globalTypes';

// ====================================================
// GraphQL fragment: ApplicationDetails
// ====================================================

export interface ApplicationDetails_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ApplicationDetails_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface ApplicationDetails_icon_whoAmI {
    id: string;
    library: ApplicationDetails_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: ApplicationDetails_icon_whoAmI_preview | null;
}

export interface ApplicationDetails_icon {
    whoAmI: ApplicationDetails_icon_whoAmI;
}

export interface ApplicationDetails_permissions {
    access_application: boolean;
    admin_application: boolean;
}

export interface ApplicationDetails {
    id: string;
    label: SystemTranslation;
    type: ApplicationType;
    description: SystemTranslation | null;
    endpoint: string | null;
    url: string | null;
    color: string | null;
    icon: ApplicationDetails_icon | null;
    module: string | null;
    permissions: ApplicationDetails_permissions;
    settings: JSONObject | null;
}
