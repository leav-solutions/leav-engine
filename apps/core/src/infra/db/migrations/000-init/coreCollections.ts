// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CollectionType} from 'arangojs/collection';

export interface IMigrationCoreCollection {
    name: string;
    type: CollectionType;
}

export const coreCollections: IMigrationCoreCollection[] = [
    {name: 'core_attributes', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_libraries', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_permissions', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_trees', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_values', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_forms', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_views', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_user_data', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_applications', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_tasks', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_version_profiles', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_api_keys', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_global_settings', type: CollectionType.DOCUMENT_COLLECTION},
    {name: 'core_edge_libraries_attributes', type: CollectionType.EDGE_COLLECTION},
    {name: 'core_edge_values_links', type: CollectionType.EDGE_COLLECTION}
];
