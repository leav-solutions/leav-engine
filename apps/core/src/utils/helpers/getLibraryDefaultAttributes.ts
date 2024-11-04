// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FilesAttributes} from '../../_types/filesManager';
import {LibraryBehavior, USERS_LIBRARY} from '../../_types/library';
import {getPreviewsAttributeName, getPreviewsStatusAttributeName} from './getPreviewsAttributes';

export default (behavior: LibraryBehavior, libraryId: string): string[] => {
    const libraryCommonAttributes = {
        [USERS_LIBRARY]: ['user_groups', 'password', 'login', 'email']
    };

    const commonAttributes = [
        ...['id', 'created_at', 'created_by', 'modified_at', 'modified_by', 'active'],
        ...(libraryCommonAttributes[libraryId] ? libraryCommonAttributes[libraryId] : [])
    ];

    if (!behavior) {
        return commonAttributes;
    }

    const behaviorSpecificAttr = {
        [LibraryBehavior.STANDARD]: [],
        [LibraryBehavior.FILES]: [
            ...Object.values(FilesAttributes),
            getPreviewsAttributeName(libraryId),
            getPreviewsStatusAttributeName(libraryId)
        ],
        [LibraryBehavior.DIRECTORIES]: [
            FilesAttributes.ROOT_KEY,
            FilesAttributes.FILE_PATH,
            FilesAttributes.FILE_NAME,
            FilesAttributes.INODE,
            FilesAttributes.ACTIVE
        ]
    };

    // Using a Set to prevent duplicates
    return [...new Set([...commonAttributes, ...behaviorSpecificAttr[behavior]])];
};
