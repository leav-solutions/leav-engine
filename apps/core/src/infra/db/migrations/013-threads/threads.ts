// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {commonAttributeData, type MigrationLibraryToCreate} from '../../helpers/libraryUtils';
import {
    THREAD_STATUSES_TREE_ID,
    COMMENTS_LIBRARY_ID,
    THREAD_STATUS_ATTRIBUTE_ID,
    THREAD_COMMENTS_ATTRIBUTE_ID,
    THREADS_LIBRARY_ID,
} from './constants';
import {AttributeTypes} from '_types/attribute';
import {type IAttributeForRepo} from 'infra/attribute/attributeRepo';
import {LibraryBehavior} from '_types/library';

export const threadsAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: THREAD_STATUS_ATTRIBUTE_ID,
        type: AttributeTypes.TREE,
        linked_tree: THREAD_STATUSES_TREE_ID,
        label: {fr: 'Statut', en: 'Status'},
    },
    {
        ...commonAttributeData,
        id: THREAD_COMMENTS_ATTRIBUTE_ID,
        type: AttributeTypes.ADVANCED_LINK,
        linked_library: COMMENTS_LIBRARY_ID,
        multiple_values: true,
        label: {fr: 'Commentaires', en: 'Comments'},
    },
];

export const threadLibrary: MigrationLibraryToCreate = {
    _key: THREADS_LIBRARY_ID,
    label: {fr: 'Fils de discussion', en: 'Discussion threads'},
    system: true,
    behavior: LibraryBehavior.STANDARD,
    recordIdentityConf: {
        label: 'label',
    },
    attributes: [
        'id',
        'created_by',
        'created_at',
        'modified_by',
        'modified_at',
        'active',
        'label',
        THREAD_STATUS_ATTRIBUTE_ID,
        THREAD_COMMENTS_ATTRIBUTE_ID,
    ],
    fullTextAttributes: ['label'],
};
