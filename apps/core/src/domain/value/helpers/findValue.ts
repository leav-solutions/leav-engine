// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isEqual} from 'lodash';
import {IFindValueTree, IValue, IValueVersion} from '_types/value';

/**
 * Get matching values for given version
 *
 * @param version
 * @param values
 */
const _getValuesForVersion = (version: IValueVersion, values: IValue[]): IValue[] => {
    return values.filter(v => isEqual(v.version, version));
};

/**
 * Find closest values matching given versions trees.
 * We start from leaves of each tree and get up on each tree consecutively until we find a value with version
 * matching our version
 *
 * Example:
 *      Tree A:                             Tree B:
 *        root                                 root
 *          └── A                                └── 1
 *              └── B                                └── 2
 *                  └── C                                └── 3
 *      Value stored on version B|2
 * Lookup order:
 *      C|3
 *      B|3
 *      A|3
 *   root|3
 *      C|2
 *      B|2   <--- Value found => we return this value
 *
 * @param trees
 * @param values
 *
 */
const findValue = (trees: IFindValueTree[], values: IValue[], firstRun = true): IValue[] => {
    let lookupTrees = [...trees];
    if (firstRun) {
        // On each tree, add a fake node with ID = null to simulate the tree root.
        // A version set to null is equivalent to a version set to the tree root
        lookupTrees = lookupTrees.map(t => ({
            ...t,
            elements: [...t.elements, {id: null}]
        }));
    }

    // Extract version from all trees at their current state
    const version = lookupTrees.reduce((vers, t) => {
        if (typeof t.elements[t.currentIndex].id !== 'undefined') {
            vers[t.name] = t.elements[t.currentIndex].id;
        }

        return vers;
    }, {});

    const matchingValues = _getValuesForVersion(version, values);

    // Yay we found a value! Just return it
    if (matchingValues.length) {
        return matchingValues;
    }

    // We run through each tree to determine what version we're checking next:
    // On the first tree having a parent, we go one level up and don't look further
    // If we reach a tree root, we start over from the bottom.
    // If we reach all trees roots, it means we're done and didn't find anything
    let indexMoved = false;
    for (const [i, tree] of lookupTrees.entries()) {
        // Element has parent, go up
        if (tree.currentIndex < tree.elements.length - 1) {
            lookupTrees[i].currentIndex++;
            indexMoved = true;
            break; // Don't look on the other trees, only one movement at a time
        } else {
            // No more parents, go back down
            lookupTrees[i].currentIndex = 0;
        }
    }

    // We changed an index somewhere so we need to keep looking with this new position
    if (indexMoved) {
        return findValue(lookupTrees, values, false);
    }

    // Last try, try to find a value with version set to null (not having all trees set to null)
    const nullValues = values.filter(v => !v.version);

    if (nullValues.length) {
        return nullValues;
    }

    // Nothing found :(
    return [];
};

export default findValue;
