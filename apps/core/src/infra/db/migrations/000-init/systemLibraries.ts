import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {CommonAttributes, FilesAttributes, UsersAttributes} from '../../../../_constants/systemAttributes';
import {LibraryBehavior} from '../../../../_types/library';
import {type MigrationLibraryToCreate} from '../../helpers/libraryUtils';

const commonLibraryData: Partial<MigrationLibraryToCreate> = {
    system: true,
    recordIdentityConf: {
        label: CommonAttributes.LABEL,
    },
    behavior: LibraryBehavior.STANDARD,
    attributes: [
        CommonAttributes.ID,
        CommonAttributes.CREATED_BY,
        CommonAttributes.CREATED_AT,
        CommonAttributes.MODIFIED_BY,
        CommonAttributes.MODIFIED_AT,
        CommonAttributes.ACTIVE,
        CommonAttributes.LABEL,
    ],
};
export const systemLibraries: MigrationLibraryToCreate[] = [
    {
        ...commonLibraryData,
        _key: SystemLibraries.USERS,
        label: {fr: 'Utilisateurs', en: 'Users'},
        fullTextAttributes: [UsersAttributes.LOGIN, UsersAttributes.EMAIL, CommonAttributes.LABEL],
        recordIdentityConf: {
            label: UsersAttributes.LOGIN,
        },
        attributes: [
            ...commonLibraryData.attributes,
            UsersAttributes.LOGIN,
            UsersAttributes.EMAIL,
            UsersAttributes.PASSWORD,
            UsersAttributes.USER_GROUPS,
        ],
    },
    {
        ...(commonLibraryData as MigrationLibraryToCreate),
        _key: SystemLibraries.USERS_GROUPS,
        fullTextAttributes: [CommonAttributes.LABEL],
        label: {fr: "Groupes d'utilisateurs", en: 'Users groups'},
    },
    {
        ...(commonLibraryData as MigrationLibraryToCreate),
        _key: SystemLibraries.FILES,
        behavior: LibraryBehavior.FILES,
        label: {fr: 'Fichiers', en: 'Files'},
        recordIdentityConf: {
            label: FilesAttributes.FILE_NAME,
        },
        fullTextAttributes: [FilesAttributes.FILE_NAME],
        attributes: [
            ...commonLibraryData.attributes,
            FilesAttributes.ROOT_KEY,
            FilesAttributes.HASH,
            FilesAttributes.FILE_PATH,
            FilesAttributes.FILE_NAME,
            FilesAttributes.INODE,
            'previews',
            'previews_status',
        ],
    },
    {
        ...(commonLibraryData as MigrationLibraryToCreate),
        _key: SystemLibraries.FILES_DIRECTORIES,
        behavior: LibraryBehavior.DIRECTORIES,
        label: {fr: 'Dossiers', en: 'Directories'},
        recordIdentityConf: {
            label: FilesAttributes.FILE_NAME,
        },
        fullTextAttributes: [FilesAttributes.FILE_NAME],
        attributes: [
            ...commonLibraryData.attributes,
            FilesAttributes.ROOT_KEY,
            FilesAttributes.HASH,
            FilesAttributes.FILE_PATH,
            FilesAttributes.FILE_NAME,
            FilesAttributes.INODE,
            'previews',
            'previews_status',
        ],
    },
];
