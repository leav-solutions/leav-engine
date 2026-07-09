import {ApplicationTypes, type IApplication} from '../../../../_types/application';

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
            trees: [],
        },
    },
    {
        _key: 'login',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'login',
        label: {fr: 'Login', en: 'Login'},
        description: {fr: "Application d'authentification", en: 'Authentication app'},
        endpoint: 'login',
    },
    {
        _key: 'portal',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'portal',
        label: {fr: 'Portail', en: 'Portal'},
        description: {fr: "Portail d'accès à toutes les applications", en: 'All applications portal'},
        endpoint: 'portal',
    },
];
