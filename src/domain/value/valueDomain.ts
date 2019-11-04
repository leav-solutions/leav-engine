import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {isEqual} from 'lodash';
import * as moment from 'moment';
import {IUtils} from 'utils/utils';
import {IRecord} from '_types/record';
import {ITreeNode} from '_types/tree';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes, IAttribute, ValueVersionMode} from '../../_types/attribute';
import {ErrorTypes} from '../../_types/errors';
import {AttributePermissionsActions, RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IValue, IValuesOptions} from '../../_types/value';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IAttributePermissionDomain} from '../permission/attributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';

export interface ISaveBatchValueError {
    type: string;
    message: string;
    input: string;
    attribute: string;
}

export interface ISaveBatchValueResult {
    values: IValue[];
    errors: ISaveBatchValueError[];
}

export interface IValueDomain {
    getValues(library: string, recordId: number, attribute: string, options?: IValuesOptions): Promise<IValue[]>;
    /**
     * Save a value
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param infos
     */
    saveValue(library: string, recordId: number, attribute: string, value: IValue, infos: IQueryInfos): Promise<IValue>;

    /**
     * Save multiple values independantly (possibly different attributes or versions).
     * If one of the value must not be saved (invalid value or user doesn't have permissions), no value is saved at all
     *
     * @param library
     * @param recordId
     * @param values
     * @param infos
     * @param keepEmpty If false, empty values will be deleted (or not saved)
     */
    saveValueBatch(
        library: string,
        recordId: number,
        values: IValue[],
        infos: IQueryInfos,
        keepEmpty?: boolean
    ): Promise<ISaveBatchValueResult>;
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

interface ILinkRecordValidationResult {
    isValid: boolean;
    reason?: string;
}

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.infra.value'?: IValueRepo;
    'core.infra.record'?: IRecordRepo;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.permission.recordPermission'?: IRecordPermissionDomain;
    'core.domain.permission.attributePermission'?: IAttributePermissionDomain;
    'core.infra.tree'?: ITreeRepo;
    'core.utils'?: IUtils;
}

export default function({
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.infra.value': valueRepo = null,
    'core.infra.record': recordRepo = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.permission.recordPermission': recordPermissionDomain = null,
    'core.domain.permission.attributePermission': attributePermissionDomain = null,
    'core.infra.tree': treeRepo = null,
    'core.utils': utils = null
}: IDeps = {}): IValueDomain {
    const _validateVersion = async (value: IValue): Promise<string[]> => {
        const trees = Object.keys(value.version);
        const existingTrees = await treeRepo.getTrees();
        const existingTreesIds = existingTrees.list.map(t => t.id);

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
                    `Element ${value.version[treeName].library}/${value.version[treeName].id}
                    not present in tree ${treeName}`
                ]);
            }
            return errors;
        }, Promise.resolve([]));
        return badElements;
    };

    /**
     * Get matching values for given version
     *
     * @param version
     * @param values
     */
    const _getValuesForVersion = (version, values): IValue[] => {
        return values.filter(v => isEqual(v.version, version));
    };

    const _mustCheckLinkedRecord = (attribute: IAttribute): boolean => {
        const linkTypes = [AttributeTypes.ADVANCED_LINK, AttributeTypes.SIMPLE_LINK, AttributeTypes.TREE];

        return linkTypes.includes(attribute.type);
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
            vers[t.name] = {library: elemLibrary, id: Number(elemId)};

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

    const _validateLibrary = async (library: string): Promise<void> => {
        const lib = await libraryDomain.getLibraries({filters: {id: library}});
        // Check if exists and can delete
        if (!lib.list.length) {
            throw new ValidationError({id: 'Unknown library'});
        }
    };

    const _doesValueExist = (value: IValue, attributeProps: IAttribute): boolean =>
        !!(value.id_value && attributeProps.type !== AttributeTypes.SIMPLE);

    const _validateLinkedRecord = async (
        value: IValue,
        attribute: IAttribute
    ): Promise<ILinkRecordValidationResult> => {
        const idAttrProps = await attributeDomain.getAttributeProperties('id');
        const records = await recordRepo.find(attribute.linked_library, [
            {
                attribute: idAttrProps,
                value: value.value
            }
        ]);

        return records.list.length
            ? {isValid: true}
            : {isValid: false, reason: `Unknown record ${value.value} in library ${attribute.linked_library}`};
    };

    const _validateTreeLinkedRecord = async (
        value: IValue,
        attribute: IAttribute
    ): Promise<ILinkRecordValidationResult> => {
        const idAttrProps = await attributeDomain.getAttributeProperties('id');
        const [library, recordId] = value.value.split('/');
        const records = await recordRepo.find(library, [
            {
                attribute: idAttrProps,
                value: recordId
            }
        ]);

        if (!records.list.length) {
            return {isValid: false, reason: `Unknown record ${recordId} in library ${library}`};
        }

        const isElementInTree = await treeRepo.isElementPresent(attribute.linked_tree, {library, id: recordId});

        if (!isElementInTree) {
            return {isValid: false, reason: `Element ${value.value} is not in tree ${attribute.linked_tree}`};
        }

        return {isValid: true};
    };

    const _validateAndPrepareValue = async (
        attributeProps: IAttribute,
        value: IValue,
        infos: IQueryInfos,
        library: string,
        recordId: number,
        keepEmpty: boolean = false
    ): Promise<IValue> => {
        const valueExists = _doesValueExist(value, attributeProps);

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

        const permToCheck =
            !keepEmpty && !value.value
                ? AttributePermissionsActions.DELETE_VALUE
                : valueExists
                ? AttributePermissionsActions.EDIT_VALUE
                : AttributePermissionsActions.CREATE_VALUE;

        const canSaveValue = await attributePermissionDomain.getAttributePermission(
            permToCheck,
            infos.userId,
            attributeProps.id,
            library,
            recordId
        );

        if (!canSaveValue) {
            throw new PermissionError(permToCheck);
        }

        // Check if value ID actually exists
        if (valueExists) {
            const existingVal = await valueRepo.getValueById(library, recordId, attributeProps, value);
            if (existingVal === null) {
                throw new ValidationError({id: 'Unknown value'});
            }
        }

        if ((!attributeProps.versions_conf || !attributeProps.versions_conf.versionable) && !!value.version) {
            delete value.version;
        }

        if (!!value.version) {
            const badElements = await _validateVersion(value);
            if (badElements.length) {
                throw new ValidationError({version: badElements.join('. ')});
            }
        }

        if (_mustCheckLinkedRecord(attributeProps)) {
            const linkedRecordValidationHandler: {
                [type: string]: (value: IValue, attribute: IAttribute) => Promise<ILinkRecordValidationResult>;
            } = {
                [AttributeTypes.SIMPLE_LINK]: _validateLinkedRecord,
                [AttributeTypes.ADVANCED_LINK]: _validateLinkedRecord,
                [AttributeTypes.TREE]: _validateTreeLinkedRecord
            };

            const isValidLink = await linkedRecordValidationHandler[attributeProps.type](value, attributeProps);

            if (!isValidLink.isValid) {
                throw new ValidationError({[attributeProps.id]: isValidLink.reason});
            }
        }

        // Execute actions list. Output value might be different from input value
        const actionsListRes =
            !!attributeProps.actions_list && !!attributeProps.actions_list.saveValue
                ? await actionsListDomain.runActionsList(attributeProps.actions_list.saveValue, value, {
                      attribute: attributeProps,
                      recordId,
                      library
                  })
                : value;

        return actionsListRes;
    };

    const _saveOneValue = async (
        library: string,
        recordId: number,
        attributeProps: IAttribute,
        value: IValue,
        infos: IQueryInfos
    ): Promise<IValue> => {
        const valueExists = _doesValueExist(value, attributeProps);

        const valueToSave = {
            ...value,
            modified_at: moment().unix()
        };

        if (!valueExists) {
            valueToSave.created_at = moment().unix();
        }

        const savedVal = valueExists
            ? await valueRepo.updateValue(library, recordId, attributeProps, valueToSave)
            : await valueRepo.createValue(library, recordId, attributeProps, valueToSave);

        return {...savedVal, attribute: attributeProps.id};
    };

    const _updateRecordLastModif = (library: string, recordId: number, infos: IQueryInfos): Promise<IRecord> => {
        return recordRepo.updateRecord(library, {
            id: recordId,
            modified_at: moment().unix(),
            modified_by: infos.userId
        });
    };

    return {
        async getValues(
            library: string,
            recordId: number,
            attribute: string,
            options?: IValuesOptions
        ): Promise<IValue[]> {
            // Get library
            const lib = await libraryDomain.getLibraries({filters: {id: library}, strictFilters: true});

            // Check if exists
            if (!lib.list.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);

            let values: IValue[];
            if (
                !attr.versions_conf ||
                !attr.versions_conf.versionable ||
                attr.versions_conf.mode === ValueVersionMode.SIMPLE
            ) {
                values = await valueRepo.getValues(library, recordId, attr, false, options);
            } else {
                // Get all values, no matter the version.
                const allValues: IValue[] = await valueRepo.getValues(library, recordId, attr, true, options);

                // Get trees ancestors
                const trees: IFindValueTree[] = await Promise.all(
                    attr.versions_conf.trees.map(
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
                values = _findValue(trees, allValues);
            }

            return values;
        },
        async saveValue(
            library: string,
            recordId: number,
            attribute: string,
            value: IValue,
            infos: IQueryInfos
        ): Promise<IValue> {
            const attributeProps = await attributeDomain.getAttributeProperties(attribute);

            await _validateLibrary(library);

            const valueToSave = await _validateAndPrepareValue(attributeProps, value, infos, library, recordId);

            const savedVal = await _saveOneValue(library, recordId, attributeProps, valueToSave, infos);

            await _updateRecordLastModif(library, recordId, infos);

            return savedVal;
        },
        async saveValueBatch(
            library: string,
            recordId: number,
            values: IValue[],
            infos: IQueryInfos,
            keepEmpty: boolean = false
        ): Promise<ISaveBatchValueResult> {
            await _validateLibrary(library);

            const saveRes: ISaveBatchValueResult = await values.reduce(
                async (promPrevRes: Promise<ISaveBatchValueResult>, value: IValue): Promise<ISaveBatchValueResult> => {
                    const prevRes = await promPrevRes;
                    try {
                        const attributeProps = await attributeDomain.getAttributeProperties(value.attribute);
                        const validValue = await _validateAndPrepareValue(
                            attributeProps,
                            value,
                            infos,
                            library,
                            recordId
                        );

                        const savedVal =
                            !keepEmpty && !value.value && value.id_value
                                ? await valueRepo.deleteValue(library, recordId, attributeProps, value)
                                : await _saveOneValue(library, recordId, attributeProps, value, infos);

                        prevRes.values.push({...savedVal, attribute: value.attribute});
                    } catch (e) {
                        if (
                            !e.type ||
                            (e.type !== ErrorTypes.VALIDATION_ERROR && e.type !== ErrorTypes.PERMISSION_ERROR)
                        ) {
                            utils.rethrow(e);
                        }

                        if (!Array.isArray(prevRes.errors)) {
                            prevRes.errors = [];
                        }

                        prevRes.errors.push({
                            type: e.type,
                            message: e.fields && e.fields[value.attribute] ? e.fields[value.attribute] : e.message,
                            input: value.value,
                            attribute: value.attribute
                        });
                    }

                    return prevRes;
                },
                Promise.resolve({values: [], errors: null})
            );

            if (saveRes.values.length) {
                await _updateRecordLastModif(library, recordId, infos);
            }

            return saveRes;
        },
        async deleteValue(
            library: string,
            recordId: number,
            attribute: string,
            value: IValue,
            infos: IQueryInfos
        ): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({filters: {id: library}});

            // Check if exists and can delete
            if (!lib.list.length) {
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
