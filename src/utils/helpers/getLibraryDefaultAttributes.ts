// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LibraryBehavior} from '../../_types/library';

export default (behavior: LibraryBehavior): string[] => {
    const commonAttributes = ['id', 'created_at', 'created_by', 'modified_at', 'modified_by', 'active'];

    if (!behavior) {
        return commonAttributes;
    }

    const behaviorSpecificAttr = {
        [LibraryBehavior.STANDARD]: [],
        [LibraryBehavior.FILES]: ['root_key', 'is_directory', 'file_path']
    };

    return [...commonAttributes, ...behaviorSpecificAttr[behavior]];
};
