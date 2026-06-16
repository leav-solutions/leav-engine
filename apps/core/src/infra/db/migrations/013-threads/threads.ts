import {BASE_ATTRIBUTES, CommonAttributes, DiscussionThreadsAttributes} from '../../../../_constants/systemAttributes';
import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {commonAttributeData, type MigrationLibraryToCreate} from '../../helpers/libraryUtils';
import {AttributeTypes} from '../../../../_types/attribute';
import {type IAttributeForRepo} from '../../../attribute/attributeRepo';
import {LibraryBehavior} from '../../../../_types/library';

export const threadsAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: DiscussionThreadsAttributes.STATUS,
        type: AttributeTypes.TREE,
        linked_tree: SystemTrees.DISCUSSION_THREAD_STATUSES,
        label: {fr: 'Statut', en: 'Status'},
    },
    {
        ...commonAttributeData,
        id: DiscussionThreadsAttributes.COMMENTS,
        type: AttributeTypes.ADVANCED_LINK,
        linked_library: SystemLibraries.DISCUSSION_COMMENTS,
        multiple_values: true,
        label: {fr: 'Commentaires', en: 'Comments'},
    },
];

export const threadLibrary: MigrationLibraryToCreate = {
    _key: SystemLibraries.DISCUSSION_THREADS,
    label: {fr: 'Fils de discussion', en: 'Discussion threads'},
    system: true,
    behavior: LibraryBehavior.STANDARD,
    recordIdentityConf: {label: CommonAttributes.LABEL},
    attributes: [
        ...BASE_ATTRIBUTES,
        CommonAttributes.LABEL,
        DiscussionThreadsAttributes.STATUS,
        DiscussionThreadsAttributes.COMMENTS,
    ],
    fullTextAttributes: [CommonAttributes.LABEL],
};
