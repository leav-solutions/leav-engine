// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApplicationTypes, IApplication} from '../../../../_types/application';

export type MigrationApplicationToCreate = IApplication & {
    _key: string;
};

export const systemApplications: MigrationApplicationToCreate[] = [
    {
        _key: 'admin',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'admin',
        label: {fr: 'Administration', en: 'Administration'},
        description: {fr: "Application d'administration", en: 'Administration app'},
        endpoint: 'admin',
        settings: {
            libraries: [],
            trees: []
        }
    },
    {
        _key: 'data_studio',
        system: false,
        type: ApplicationTypes.INTERNAL,
        module: 'data-studio',
        label: {fr: 'Data Studio', en: 'Data Studio'},
        description: {
            fr: 'Application générique pour gérer et explorer vos données',
            en: 'Generic app to manage and explore your data'
        },
        endpoint: 'data-studio',
        settings: {
            libraries: 'all',
            trees: 'all'
        }
    },
    {
        _key: 'login',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'login',
        label: {fr: 'Login', en: 'Login'},
        description: {fr: "Application d'authentification", en: 'Authentication app'},
        endpoint: 'login'
    },
    {
        _key: 'portal',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'portal',
        label: {fr: 'Portail', en: 'Portal'},
        description: {fr: "Portail d'accès à toutes les applications", en: 'All applications portal'},
        endpoint: 'portal'
    }
];
