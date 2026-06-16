import {SystemLibraries} from '../../_constants/systemLibraries';
import {BASE_ATTRIBUTES, FilesAttributes, UsersAttributes} from '../../_constants/systemAttributes';
import {LibraryBehavior} from '../../_types/library';
import {getPreviewsAttributeName, getPreviewsStatusAttributeName} from './getPreviewsAttributes';

export default (behavior: LibraryBehavior, libraryId: string): string[] => {
    const libraryCommonAttributes = {
        [SystemLibraries.USERS]: [
            UsersAttributes.USER_GROUPS,
            UsersAttributes.PASSWORD,
            UsersAttributes.LOGIN,
            UsersAttributes.EMAIL,
        ],
    };

    const commonAttributes = [
        ...BASE_ATTRIBUTES,
        ...(libraryCommonAttributes[libraryId] ? libraryCommonAttributes[libraryId] : []),
    ];

    if (!behavior) {
        return commonAttributes;
    }

    const behaviorSpecificAttr = {
        [LibraryBehavior.STANDARD]: [],
        [LibraryBehavior.JOIN]: [],
        [LibraryBehavior.FILES]: [
            ...Object.values(FilesAttributes),
            getPreviewsAttributeName(libraryId),
            getPreviewsStatusAttributeName(libraryId),
        ],
        [LibraryBehavior.DIRECTORIES]: [
            FilesAttributes.ROOT_KEY,
            FilesAttributes.FILE_PATH,
            FilesAttributes.FILE_NAME,
            FilesAttributes.INODE,
            FilesAttributes.ACTIVE,
        ],
    };

    // Using a Set to prevent duplicates
    return [...new Set([...commonAttributes, ...behaviorSpecificAttr[behavior]])];
};
