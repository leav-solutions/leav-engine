import {BASE_ATTRIBUTES, CommonAttributes, StatusesAttributes} from '../../../../_constants/systemAttributes';
import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {
    commonAttributeData,
    type MigrationLibraryToCreate,
    type MigrationTreeToCreate,
} from '../../helpers/libraryUtils';
import {TreeBehavior} from '../../../../_types/tree';
import {LibraryBehavior} from '../../../../_types/library';
import {type IAttributeForRepo} from '../../../attribute/attributeRepo';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';

export const statusesAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: StatusesAttributes.LABEL,
        type: AttributeTypes.ADVANCED,
        format: AttributeFormats.TEXT,
        label: {fr: 'Libellé', en: 'Label'},
    },
    {
        ...commonAttributeData,
        id: StatusesAttributes.COLOR,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.COLOR,
        label: {fr: 'Couleur', en: 'Color'},
    },
];

export const statusesLibrary: MigrationLibraryToCreate = {
    _key: SystemLibraries.STATUSES,
    label: {fr: 'Statuts', en: 'Statuses'},
    behavior: LibraryBehavior.STANDARD,
    attributes: [...BASE_ATTRIBUTES, CommonAttributes.LABEL, StatusesAttributes.LABEL, StatusesAttributes.COLOR],
    system: true,
    recordIdentityConf: {label: StatusesAttributes.LABEL, color: StatusesAttributes.COLOR},
    fullTextAttributes: [StatusesAttributes.LABEL],
};

export const threadStatusTree: MigrationTreeToCreate = {
    system: true,
    behavior: TreeBehavior.STANDARD,
    _key: SystemTrees.DISCUSSION_THREAD_STATUSES,
    label: {fr: 'Arbre des statuts de fils de discussion', en: 'Discussion thread statuses tree'},
    libraries: {
        [SystemLibraries.STATUSES]: {
            allowedAtRoot: true,
            allowedChildren: [SystemLibraries.STATUSES],
            allowMultiplePositions: true,
        },
    },
};
