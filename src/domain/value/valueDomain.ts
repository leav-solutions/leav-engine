import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {isEqual} from 'lodash';
import * as moment from 'moment';
import {ITreeNode} from '_types/tree';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {AttributePermissionsActions, RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IValue, IValuesOptions} from '../../_types/value';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IAttributePermissionDomain} from '../permission/attributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';

export interface IValueDomain {
    getValues(library: string, recordId: number, attribute: string, options?: IValuesOptions): Promise<IValue[]>;
    saveValue(library: string, recordId: number, attribute: string, value: IValue, infos: IQueryInfos): Promise<IValue>;
    deleteValue(
        library: string,
        recordId: number,
        attribute: string,
        value: IValue,
        infos: IQueryInfos
    ): Promise<IValue>;
}

interface IFindValueTree {
    name: string;
    currentIndex: number;
    elements: ITreeNode[];
}

export default function(
    attributeDomain: IAttributeDomain = null,
    libraryDomain: ILibraryDomain = null,
    valueRepo: IValueRepo = null,
    recordRepo: IRecordRepo = null,
    actionsListDomain: IActionsListDomain = null,
    recordPermissionDomain: IRecordPermissionDomain = null,
    attributePermissionDomain: IAttributePermissionDomain = null,
    treeRepo: ITreeRepo = null
): IValueDomain {
    const _validateVersion = async (value: IValue): Promise<string[]> => {
        const trees = Object.keys(value.version);
        const existingTrees = await treeRepo.getTrees();
        const existingTreesIds = existingTrees.map(t => t.id);

        const badElements = await trees.reduce(async (prevErrors, treeName) => {
            // As our reduce function is async, we must wait for previous iteration to resolve
            const errors = await prevErrors;

            if (!existingTreesIds.includes(treeName)) {
                errors.push([`Unknown tree ${treeName}`]);
                return errors;
            }

            const isPresent = await treeRepo.isElementPresent(treeName, value.version[treeName]);
            if (!isPresent) {
                errors.push([
                    `Element ${value.version[treeName].library}/${
                        value.version[treeName].id
                    } not present in tree ${treeName}`
                ]);
            }
            return errors;
        }, Promise.resolve([]));
        return badElements;
    };

    /**
     * Get maching values for given version
     *
     * @param version
     * @param values
     */
    const _getValuesForVersion = (version, values): IValue[] => {
        return values.filter(v => isEqual(v.version, version));
    };

    /**
     * Find closest values matching given versions trees.
     * We start from leaves of each tree and get up on each tree consecutively until we find a value with version
     * matcing our version
     *
     * Example:
     *      Tree A:                             Tree B:
     *          ├── A                                ├── 1
     *              └── B                                └── 2
     *                  └── C                                └── 3
     *      Value stored on version B|2
     * Lookup order:
     *      C|3
     *      B|3
     *      A|3
     *      C|2
     *      B|2   <--- Value found => we return this value
     *
     * @param trees
     * @param values
     */
    const _findValue = (trees: IFindValueTree[], values: IValue[]): IValue[] => {
        // Extract version from all trees at their current state
        const version = trees.reduce((vers, t) => {
            const {library: elemLibrary, id: elemId} = t.elements[t.currentIndex].record;
            vers[t.name] = {library: elemLibrary, id: elemId};

            return vers;
        }, {});

        const matchingValues = _getValuesForVersion(version, values);
        // Yay we found a value! Just return it
        if (matchingValues.length) {
            return matchingValues;
        }

        // We run through each tree to determine what version we're checking next:
        //      On the first tree having a parent, we go one level up and don't look further
        //      If we reach a tree root, we start over from the bottom.
        //      If we reach all trees roots, it means we're done and didn't find anything
        let indexMoved = false;
        for (const [i, tree] of trees.entries()) {
            // Element has parent, go up
            if (tree.currentIndex < tree.elements.length - 1) {
                trees[i].currentIndex++;
                indexMoved = true;
                break; // Don't look on the other trees, only one movement at a time
            } else {
                // No more parents, go back down
                trees[i].currentIndex = 0;
            }
        }

        // We changed an index somewhere so we need to keep looking with this new position
        if (indexMoved) {
            return _findValue(trees, values);
        }

        // Nothing found :(
        return [];
    };

    return {
        async getValues(
            library: string,
            recordId: number,
            attribute: string,
            options?: IValuesOptions
        ): Promise<IValue[]> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);

            if (!attr.versionsConf || !attr.versionsConf.versionable) {
                return valueRepo.getValues(library, recordId, attr, false, options);
            } else {
                // Get all values, no matter the version.
                const allValues: IValue[] = await valueRepo.getValues(library, recordId, attr, true, options);

                // Get trees ancestors
                const trees: IFindValueTree[] = await Promise.all(
                    attr.versionsConf.trees.map(
                        async (treeName: string): Promise<IFindValueTree> => {
                            const ancestors = await treeRepo.getElementAncestors(treeName, options.version[treeName]);
                            return {
                                name: treeName,
                                currentIndex: 0,
                                elements: ancestors
                            };
                        }
                    )
                );

                // Retrieve appropriate value among all values
                return _findValue(trees, allValues);
            }
        },
        async saveValue(
            library: string,
            recordId: number,
            attribute: string,
            value: IValue,
            infos: IQueryInfos
        ): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});
            const attrData = await attributeDomain.getAttributeProperties(attribute);
            const valueExists = value.id_value && attrData.type !== AttributeTypes.SIMPLE;

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            // Check permission
            const canUpdateRecord = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.EDIT,
                infos.userId,
                library,
                recordId
            );

            if (!canUpdateRecord) {
                throw new PermissionError(RecordPermissionsActions.EDIT);
            }

            const permToCheck = valueExists
                ? AttributePermissionsActions.EDIT_VALUE
                : AttributePermissionsActions.CREATE_VALUE;

            const canSaveValue = await attributePermissionDomain.getAttributePermission(
                permToCheck,
                infos.userId,
                attribute,
                library,
                recordId
            );

            if (!canSaveValue) {
                throw new PermissionError(permToCheck);
            }

            // Check if value ID actually exists
            if (valueExists) {
                const existingVal = await valueRepo.getValueById(library, recordId, attrData, value);

                if (existingVal === null) {
                    throw new ValidationError({id: 'Unknown value'});
                }
            }

            if (!!value.version) {
                if (!attrData.versionsConf.versionable) {
                    throw new ValidationError({version: 'Attribute is not versionable'});
                }

                const badElements = await _validateVersion(value);

                if (badElements.length) {
                    throw new ValidationError({version: badElements.join('. ')});
                }
            }

            // Execute actions list. Output value might be different from input value
            const actionsListRes =
                !!attrData.actions_list && !!attrData.actions_list.saveValue
                    ? await actionsListDomain.runActionsList(attrData.actions_list.saveValue, value, {
                          attribute: attrData,
                          recordId,
                          library
                      })
                    : value;

            const valueToSave = {
                ...actionsListRes,
                modified_at: moment().unix()
            };

            if (!value.id_value) {
                valueToSave.created_at = moment().unix();
            }

            const savedVal = valueExists
                ? await valueRepo.updateValue(library, recordId, attrData, valueToSave)
                : await valueRepo.createValue(library, recordId, attrData, valueToSave);

            const updatedRecord = await recordRepo.updateRecord(library, {id: recordId, modified_at: moment().unix()});

            return savedVal;
        },
        async deleteValue(
            library: string,
            recordId: number,
            attribute: string,
            value: IValue,
            infos: IQueryInfos
        ): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            // Check permission
            const canUpdateRecord = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.EDIT,
                infos.userId,
                library,
                recordId
            );

            if (!canUpdateRecord) {
                throw new PermissionError(RecordPermissionsActions.EDIT);
            }

            const canSaveValue = await attributePermissionDomain.getAttributePermission(
                AttributePermissionsActions.DELETE_VALUE,
                infos.userId,
                attribute,
                library,
                recordId
            );

            if (!canSaveValue) {
                throw new PermissionError(AttributePermissionsActions.DELETE_VALUE);
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);
            // Check if value ID actually exists
            if (value.id_value && attr.type !== AttributeTypes.SIMPLE) {
                const existingVal = await valueRepo.getValueById(library, recordId, attr, value);

                if (existingVal === null) {
                    throw new ValidationError({id: 'Unknown value'});
                }
            }

            const actionsListRes =
                !!attr.actions_list && !!attr.actions_list.deleteValue
                    ? await actionsListDomain.runActionsList(attr.actions_list.deleteValue, value, {
                          attribute: attr,
                          recordId,
                          library,
                          value
                      })
                    : value;

            return valueRepo.deleteValue(library, recordId, attr, actionsListRes);
        }
    };
}
