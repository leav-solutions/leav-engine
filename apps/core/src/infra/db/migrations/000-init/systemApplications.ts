import {ApplicationTypes, IApplication} from '../../../../_types/application';

export type MigrationApplicationToCreate = IApplication & {
    _key: string;
};

export const systemApplications: MigrationApplicationToCreate[] = [
    {
        _key: 'admin',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'admin-app',
        label: {fr: 'Administration', en: 'Administration'},
        description: {fr: "Application d'administration", en: 'Administration app'},
        endpoint: 'admin',
        libraries: [],
        trees: []
    },
    {
        _key: 'data-studio',
        system: false,
        type: ApplicationTypes.INTERNAL,
        module: 'data-studio',
        label: {fr: 'Data Studio', en: 'Data Studio'},
        description: {
            fr: 'Application générique pour gérer et explorer vos données',
            en: 'Generic app to manage and explore your data'
        },
        endpoint: 'data-studio',
        libraries: [],
        trees: []
    },
    {
        _key: 'login',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'login',
        label: {fr: 'Login', en: 'Login'},
        description: {fr: "Application d'authentification", en: 'Authentication app'},
        endpoint: 'login',
        libraries: [],
        trees: []
    },
    {
        _key: 'portal',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'portal',
        label: {fr: 'Portail', en: 'Portal'},
        description: {fr: "Portail d'accès à toutes les applications", en: 'All applications portal'},
        endpoint: 'portal',
        libraries: [],
        trees: []
    }
];
