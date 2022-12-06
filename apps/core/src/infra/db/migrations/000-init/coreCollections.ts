import {collectionTypes} from '../../dbService';

export interface IMigrationCoreCollection {
    name: string;
    type: collectionTypes;
}

export const coreCollections: IMigrationCoreCollection[] = [
    {name: 'core_attributes', type: collectionTypes.DOCUMENT},
    {name: 'core_libraries', type: collectionTypes.DOCUMENT},
    {name: 'core_permissions', type: collectionTypes.DOCUMENT},
    {name: 'core_trees', type: collectionTypes.DOCUMENT},
    {name: 'core_values', type: collectionTypes.DOCUMENT},
    {name: 'core_forms', type: collectionTypes.DOCUMENT},
    {name: 'core_views', type: collectionTypes.DOCUMENT},
    {name: 'core_user_data', type: collectionTypes.DOCUMENT},
    {name: 'core_applications', type: collectionTypes.DOCUMENT},
    {name: 'core_tasks', type: collectionTypes.DOCUMENT},
    {name: 'core_version_profiles', type: collectionTypes.DOCUMENT},
    {name: 'core_api_keys', type: collectionTypes.DOCUMENT},
    {name: 'core_edge_libraries_attributes', type: collectionTypes.EDGE},
    {name: 'core_edge_values_links', type: collectionTypes.EDGE}
];
