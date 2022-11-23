// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValueVersion} from '_types/types';

/**
 * Check if given version matches the reference version. As reference version might contains
 * trees that are not in the given version, we only check the nodes of given version against reference version.
 */
export default (referenceVersion: IValueVersion, valueVersion: IValueVersion) => {
    if (referenceVersion === valueVersion) {
        // Mostly for the case that both are null or undefined
        return true;
    }

    if (!referenceVersion || !valueVersion) {
        return false;
    }

    const hasReferenceVersion = !!Object.keys(referenceVersion).length;
    const hasValueVersion = !!Object.keys(valueVersion).length;
    if (hasReferenceVersion && !hasValueVersion) {
        return false;
    }

    for (const versionTreeId of Object.keys(valueVersion)) {
        if (referenceVersion?.[versionTreeId]?.id !== valueVersion[versionTreeId]?.id) {
            return false;
        }
    }

    return true;
};
