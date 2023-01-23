// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationType, ApplicationInstallStatus} from './globalTypes';

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
}

export interface ApplicationDetails_icon_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ApplicationDetails_icon_whoAmI_library;
    preview: ApplicationDetails_icon_whoAmI_preview | null;
}

export interface ApplicationDetails_icon {
    id: string;
    whoAmI: ApplicationDetails_icon_whoAmI;
}

export interface ApplicationDetails_permissions {
    access_application: boolean;
}

export interface ApplicationDetails_install {
    status: ApplicationInstallStatus;
    lastCallResult: string | null;
}

export interface ApplicationDetails {
    id: string;
    label: SystemTranslation;
    type: ApplicationType;
    description: SystemTranslation | null;
    endpoint: string;
    url: string;
    color: string | null;
    icon: ApplicationDetails_icon | null;
    permissions: ApplicationDetails_permissions;
    install: ApplicationDetails_install | null;
}
