import {LibraryBehavior} from '../../../_types/library';

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
