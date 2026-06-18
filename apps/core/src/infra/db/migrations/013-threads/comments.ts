import {
    BASE_ATTRIBUTES,
    CommonAttributes,
    DiscussionCommentsAttributes,
    DiscussionThreadsAttributes,
} from '../../../../_constants/systemAttributes';
import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {commonAttributeData, type MigrationLibraryToCreate} from '../../helpers/libraryUtils';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {type IAttributeForRepo} from '../../../attribute/attributeRepo';
import {LibraryBehavior} from '../../../../_types/library';

export const commentAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: DiscussionCommentsAttributes.CONTENT,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Contenu', en: 'Body'},
    },
    {
        ...commonAttributeData,
        id: DiscussionCommentsAttributes.THREAD,
        type: AttributeTypes.SIMPLE_LINK,
        linked_library: SystemLibraries.DISCUSSION_THREADS,
        reverse_link: DiscussionThreadsAttributes.COMMENTS,
        label: {fr: 'Fil de discussion associé', en: 'Related discussion thread'},
    },
];

export const commentLibrary: MigrationLibraryToCreate = {
    _key: SystemLibraries.DISCUSSION_COMMENTS,
    label: {fr: 'Commentaires', en: 'Comments'},
    system: true,
    behavior: LibraryBehavior.STANDARD,
    recordIdentityConf: {label: CommonAttributes.LABEL},
    attributes: [
        ...BASE_ATTRIBUTES,
        CommonAttributes.LABEL,
        DiscussionCommentsAttributes.CONTENT,
        DiscussionCommentsAttributes.THREAD,
    ],
    fullTextAttributes: [CommonAttributes.LABEL],
};
