import {
    commonAttributeData,
    type MigrationLibraryToCreate,
    type MigrationTreeToCreate,
} from '../../helpers/libraryUtils';
import {THREAD_STATUSES_TREE_ID} from '../../migrationConstants/threads';
import {
    STATUSES_COLOR_ATTRIBUTE_ID,
    STATUSES_LABEL_ATTRIBUTE_ID,
    STATUSES_LIBRARY_ID,
} from '../../migrationConstants/statuses';
import {TreeBehavior} from '../../../../_types/tree';
import {LibraryBehavior} from '../../../../_types/library';
import {type IAttributeForRepo} from '../../../attribute/attributeRepo';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';

export const statusesAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: STATUSES_LABEL_ATTRIBUTE_ID,
        type: AttributeTypes.ADVANCED,
        format: AttributeFormats.TEXT,
        label: {fr: 'Libellé', en: 'Label'},
    },
    {
        ...commonAttributeData,
        id: STATUSES_COLOR_ATTRIBUTE_ID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.COLOR,
        label: {fr: 'Couleur', en: 'Color'},
    },
];

export const statusesLibrary: MigrationLibraryToCreate = {
    _key: STATUSES_LIBRARY_ID,
    label: {fr: 'Statuts', en: 'Statuses'},
    behavior: LibraryBehavior.STANDARD,
    attributes: [
        'id',
        'created_by',
        'created_at',
        'modified_by',
        'modified_at',
        'active',
        'label',
        STATUSES_LABEL_ATTRIBUTE_ID,
        STATUSES_COLOR_ATTRIBUTE_ID,
    ],
    system: true,
    recordIdentityConf: {label: STATUSES_LABEL_ATTRIBUTE_ID, color: STATUSES_COLOR_ATTRIBUTE_ID},
    fullTextAttributes: [STATUSES_LABEL_ATTRIBUTE_ID],
};

export const threadStatusTree: MigrationTreeToCreate = {
    system: true,
    behavior: TreeBehavior.STANDARD,
    _key: THREAD_STATUSES_TREE_ID,
    label: {fr: 'Arbre des statuts de fils de discussion', en: 'Discussion thread statuses tree'},
    libraries: {
        [STATUSES_LIBRARY_ID]: {
            allowedAtRoot: true,
            allowedChildren: [STATUSES_LIBRARY_ID],
            allowMultiplePositions: true,
        },
    },
};
