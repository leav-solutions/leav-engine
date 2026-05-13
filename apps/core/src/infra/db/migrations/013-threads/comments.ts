import {commonAttributeData, type MigrationLibraryToCreate} from '../../helpers/libraryUtils';
import {
    COMMENT_CONTENT_ATTRIBUTE_ID,
    COMMENT_THREAD_ATTRIBUTE_ID,
    COMMENTS_LIBRARY_ID,
    THREAD_COMMENTS_ATTRIBUTE_ID,
    THREADS_LIBRARY_ID,
} from './constants';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {type IAttributeForRepo} from '../../../attribute/attributeRepo';
import {LibraryBehavior} from '../../../../_types/library';

export const commentAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: COMMENT_CONTENT_ATTRIBUTE_ID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Contenu', en: 'Body'},
    },
    {
        ...commonAttributeData,
        id: COMMENT_THREAD_ATTRIBUTE_ID,
        type: AttributeTypes.SIMPLE_LINK,
        linked_library: THREADS_LIBRARY_ID,
        reverse_link: THREAD_COMMENTS_ATTRIBUTE_ID,
        label: {fr: 'Fil de discussion associé', en: 'Related discussion thread'},
    },
];

export const commentLibrary: MigrationLibraryToCreate = {
    _key: COMMENTS_LIBRARY_ID,
    label: {fr: 'Commentaires', en: 'Comments'},
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
        COMMENT_CONTENT_ATTRIBUTE_ID,
        COMMENT_THREAD_ATTRIBUTE_ID,
    ],
    fullTextAttributes: ['label'],
};
