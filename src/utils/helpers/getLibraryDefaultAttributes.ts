// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LibraryBehavior, USERS_LIBRARY} from '../../_types/library';

export default (behavior: LibraryBehavior, libraryId: string): string[] => {
    const libraryCommonAttributes = {
        [USERS_LIBRARY]: ['user_groups', 'password', 'login']
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
        [LibraryBehavior.FILES]: ['root_key', 'is_directory', 'file_path']
    };

    return [...commonAttributes, ...behaviorSpecificAttr[behavior]];
};
