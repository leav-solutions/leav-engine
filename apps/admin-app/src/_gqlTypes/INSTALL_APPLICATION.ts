// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationInstallStatus} from './globalTypes';

// ====================================================
// GraphQL mutation operation: INSTALL_APPLICATION
// ====================================================

export interface INSTALL_APPLICATION_installApplication {
    status: ApplicationInstallStatus;
    lastCallResult: string | null;
}

export interface INSTALL_APPLICATION {
    installApplication: INSTALL_APPLICATION_installApplication;
}

export interface INSTALL_APPLICATIONVariables {
    id: string;
}
