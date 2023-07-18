// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormUIElementTypes, FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IAttributePermissionDomain} from 'domain/permission/attributePermissionDomain';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IRecordAttributePermissionDomain} from 'domain/permission/recordAttributePermissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {i18n} from 'i18next';
import {IFormRepo} from 'infra/form/formRepo';
import {difference, uniqueId} from 'lodash';
import omit from 'lodash/omit';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IValueVersion} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {
    FormElementTypes,
    IForm,
    IFormElement,
    IFormElementWithValues,
    IFormElementWithValuesAndChildren,
    IFormFilterOptions,
    IFormStrict,
    IRecordForm
} from '../../_types/forms';
import {IList, SortOrder} from '../../_types/list';
import {
    AttributePermissionsActions,
    LibraryPermissionsActions,
    RecordAttributePermissionsActions
} from '../../_types/permissions';
import {getElementValues} from './helpers/getElementValues';
import {mustIncludeElement} from './helpers/mustIncludeElement';

export interface IFormDomain {
    getFormsByLib({
        library,
        params,
        ctx
    }: {
        library: string;
        params?: IGetCoreEntitiesParams;
        ctx: IQueryInfos;
    }): Promise<IList<IForm>>;
    getRecordForm(params: {
        recordId: string;
        libraryId: string;
        formId: string;
        version?: IValueVersion;
        ctx: IQueryInfos;
    }): Promise<IRecordForm>;
    getFormProperties({library, id, ctx}: {library: string; id: string; ctx: IQueryInfos}): Promise<IForm>;
    saveForm({form, ctx}: {form: IForm; ctx: IQueryInfos}): Promise<IForm>;
    deleteForm({library, id, ctx}: {library: string; id: string; ctx: IQueryInfos}): Promise<IForm>;
}

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.permission.library'?: ILibraryPermissionDomain;
    'core.domain.permission.recordAttribute'?: IRecordAttributePermissionDomain;
    'core.domain.permission.attribute'?: IAttributePermissionDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.tree'?: ITreeDomain;
    'core.infra.form'?: IFormRepo;
    'core.utils'?: IUtils;
    'core.utils.logger'?: winston.Winston;
    translator?: i18n;
}

export default function (deps: IDeps = {}): IFormDomain {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.domain.permission.library': libraryPermissionDomain = null,
        'core.domain.permission.recordAttribute': recordAttributePermissionDomain = null,
        'core.domain.permission.attribute': attributePermissionDomain = null,
        'core.domain.helpers.validate': validateHelper = null,
        'core.domain.tree': treeDomain = null,
        'core.infra.form': formRepo = null,
        'core.utils': utils = null,
        'core.utils.logger': logger = null,
        translator = null
    } = deps;

    const _canAccessAttribute = (attribute: string, libraryId: string, recordId: string, ctx: IQueryInfos) => {
        return recordId && libraryId
            ? recordAttributePermissionDomain.getRecordAttributePermission(
                  RecordAttributePermissionsActions.ACCESS_ATTRIBUTE,
                  ctx.userId,
                  attribute,
                  libraryId,
                  recordId,
                  ctx
              )
            : attributePermissionDomain.getAttributePermission({
                  action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                  attributeId: attribute,
                  ctx
              });
    };

    const _getMissingFormDefaultProps = async ({library, id, ctx}): Promise<IForm> => {
        const defaultElements: IFormElement[] = [
            {
                id: uniqueId(),
                containerId: FORM_ROOT_CONTAINER_ID,
                order: 0,
                uiElementType: 'text_block',
                type: FormElementTypes.layout,
                settings: {content: translator.t('forms.missing_form_warning', {idForm: id})}
            },
            {
                id: uniqueId(),
                containerId: FORM_ROOT_CONTAINER_ID,
                order: 1,
                uiElementType: 'divider',
                type: FormElementTypes.layout,
                settings: null
            }
        ];

        const attributes = await attributeDomain.getLibraryAttributes(library, ctx);
        const nonReadonlyAttributes = attributes.filter(att => !att?.readonly);
        const attributesElements = nonReadonlyAttributes.map(
            (att, index): IFormElement => {
                const data: IFormElement = {
                    id: uniqueId(),
                    containerId: FORM_ROOT_CONTAINER_ID,
                    order: index + 2,
                    uiElementType: 'input_field',
                    type: FormElementTypes.field,
                    settings: {
                        label: att.label?.[translator.language] || att.id,
                        attribute: att.id
                    }
                };
                switch (att.type) {
                    case AttributeTypes.SIMPLE:
                    case AttributeTypes.ADVANCED:
                        data.uiElementType = 'input_field';
                        break;
                    case AttributeTypes.SIMPLE_LINK:
                    case AttributeTypes.ADVANCED_LINK:
                        data.settings = {
                            displayRecordIdentity: true,
                            label: att.label?.[translator.language] || att.id,
                            attribute: att.id
                        };
                        data.uiElementType = 'link';
                        break;
                    case AttributeTypes.TREE:
                        data.uiElementType = 'tree';
                        break;
                }

                return data;
            }
        );

        const finalElements = [...defaultElements, ...attributesElements];

        return {
            library,
            elements: [
                {
                    elements: finalElements
                }
            ]
        };
    };

    return {
        async getFormsByLib({library, params, ctx}): Promise<IList<IForm>> {
            const filters = {...params?.filters, library};
            const initializedParams = {...params, filters};

            await validateHelper.validateLibrary(library, ctx);

            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return formRepo.getForms({params: initializedParams, ctx});
        },
        async getRecordForm({recordId, libraryId, formId, version, ctx}): Promise<IRecordForm> {
            let formProps: IForm;
            try {
                formProps = await this.getFormProperties({library: libraryId, id: formId, ctx});
            } catch (error) {
                if (error instanceof ValidationError) {
                    if (error.fields.id === Errors.UNKNOWN_FORM) {
                        formProps = await _getMissingFormDefaultProps({library: libraryId, id: formId, ctx});
                    }
                } else {
                    throw error;
                }
            }

            const flatElementsList: IFormElementWithValuesAndChildren[] = [];

            // Retrieve all relevant attributes in a hash map. It will be used later on to filter out empty containers
            const elementsHashMap: {[id: string]: IFormElementWithValuesAndChildren} = await formProps.elements.reduce(
                async (allElemsProm: Promise<{[id: string]: IFormElementWithValuesAndChildren}>, elementsWithDeps) => {
                    const allElems = await allElemsProm;

                    // Check if elements must be included based on dependencies
                    if (!(await mustIncludeElement(elementsWithDeps, recordId, libraryId, deps, ctx))) {
                        return allElems;
                    }

                    // Retrieve all visible form elements (based on permissions), with their values
                    for (const depElement of elementsWithDeps.elements) {
                        let isElementVisible: boolean;
                        let elementError: string;
                        try {
                            isElementVisible =
                                depElement.uiElementType === FormElementTypes.layout ||
                                !depElement.settings?.attribute ||
                                (await _canAccessAttribute(depElement.settings.attribute, libraryId, recordId, ctx));
                        } catch (error) {
                            // If something went wrong, we assume the element is not visible
                            isElementVisible = false;
                            logger.error(error);
                            logger.error('Form element was ', depElement);
                        }

                        if (isElementVisible) {
                            const {error: valueError, values} = await getElementValues({
                                element: depElement,
                                recordId,
                                libraryId,
                                version,
                                deps,
                                ctx
                            });

                            const depElementWithValues: IFormElementWithValuesAndChildren = {
                                ...depElement,
                                values,
                                valueError: elementError || valueError,
                                children: []
                            };

                            // Add elements to the flat list as well, as we'll to run through all elements easily
                            // to filters out empty containers
                            flatElementsList.push(depElementWithValues);
                            allElems[depElement.id] = depElementWithValues;

                            // Tabs are not real container, it's only in element's settings.
                            // We need to add it to hash map to be able to clear out empty tabs
                            if (depElement.uiElementType === FormUIElementTypes.TABS && depElement.settings.tabs) {
                                for (const [i, tab] of depElement.settings.tabs.entries()) {
                                    const tabContainer = {
                                        id: `${depElement.id}/${tab.id}`,
                                        type: FormElementTypes.layout,
                                        uiElementType: FormUIElementTypes.TAB_FIELDS_CONTAINER,
                                        children: [],
                                        values: null,
                                        order: i,
                                        containerId: depElement.id
                                    };
                                    flatElementsList.push(tabContainer);
                                    allElems[tabContainer.id] = tabContainer;
                                }
                            }
                        }
                    }

                    return allElems;
                },
                Promise.resolve({})
            );

            // Convert hash map to tree structure in order to filter out empty containers
            const elementsTree = [];
            for (const element of flatElementsList) {
                if (element.containerId !== FORM_ROOT_CONTAINER_ID) {
                    elementsHashMap[element.containerId]?.children.push(elementsHashMap[element.id]);
                } else {
                    elementsTree.push(elementsHashMap[element.id]);
                }
            }

            /**
             * Recursively filters out all empty containers:
             * if a container has children somewhere, keep it otherwise discard it.
             * If a form has no visible field at all, nothing will be returned, including all other layout elements
             */
            const _filterEmptyContainers = (
                elements: IFormElementWithValuesAndChildren[]
            ): {children: IFormElementWithValues[]; hasFields: boolean} => {
                let elementsToKeep: IFormElementWithValuesAndChildren[] = [];
                let hasFields = false; // Used to inform caller about presence of a field

                // All elements here are brother in the form.
                // We check if each element is a field or a field somewhere in its descendants
                for (const elem of elements) {
                    let _childrenToKeep = [];

                    // We have children, let's check descendants.
                    if (
                        elem.uiElementType === FormUIElementTypes.FIELDS_CONTAINER ||
                        elem.uiElementType === FormUIElementTypes.TAB_FIELDS_CONTAINER ||
                        elem.uiElementType === FormUIElementTypes.TABS
                    ) {
                        const {hasFields: childHasFields, children} = _filterEmptyContainers(elem.children);
                        if (childHasFields) {
                            if (elem.uiElementType === FormUIElementTypes.TABS) {
                                // If element is a tab => update settings
                                elem.settings.tabs = (elem.settings ?? {}).tabs.filter(tab =>
                                    children.some(c => c.id === `${elem.id}/${tab.id}`)
                                );
                            }

                            // If element has children we must keep element itself and its children
                            _childrenToKeep = [
                                omit(elem, ['children']),
                                ...children.filter(c => c.uiElementType !== FormUIElementTypes.TAB_FIELDS_CONTAINER)
                            ];
                        }
                        hasFields = hasFields || childHasFields;
                    } else {
                        _childrenToKeep = [omit(elem, ['children'])];

                        if (elem.type === FormElementTypes.field) {
                            hasFields = true;
                        }
                    }

                    elementsToKeep = [...elementsToKeep, ..._childrenToKeep];
                }

                return {children: elementsToKeep, hasFields};
            };

            const formElements = _filterEmptyContainers(elementsTree).children;
            return {
                id: formId,
                recordId,
                system: formProps.system,
                library: libraryId,
                dependencyAttributes: formProps.dependencyAttributes,
                elements: formElements
            };
        },
        async getFormProperties({library, id, ctx}): Promise<IForm> {
            const filters = {id, library};

            await validateHelper.validateLibrary(library, ctx);

            const forms = await formRepo.getForms({
                params: {filters, strictFilters: true, withCount: false},
                ctx
            });

            if (!forms.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_FORM});
            }

            return forms.list[0];
        },
        async saveForm({form, ctx}): Promise<IForm> {
            const defaultParams: IFormStrict = {
                id: '',
                library: '',
                system: false,
                dependencyAttributes: [],
                label: {fr: '', en: ''},
                elements: []
            };

            const filters: IFormFilterOptions = {library: form.library, id: form.id};
            // Check if form exists
            const forms = await formRepo.getForms({
                params: {
                    filters,
                    strictFilters: true,
                    withCount: false
                },
                ctx
            });

            const existingForm = !!forms.list.length;

            const dataToSave = existingForm
                ? {...defaultParams, ...forms.list[0], ...form}
                : {...defaultParams, ...form};

            // Check permissions
            const permToCheck = LibraryPermissionsActions.ADMIN_LIBRARY;
            if (
                !(await libraryPermissionDomain.getLibraryPermission({
                    libraryId: form.library,
                    action: permToCheck,
                    userId: ctx.userId,
                    ctx
                }))
            ) {
                throw new PermissionError(permToCheck);
            }

            await validateHelper.validateLibrary(dataToSave.library, ctx);

            // Validate ID
            if (!utils.isIdValid(dataToSave.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            // Extract attributes from form data
            if (dataToSave.elements?.length) {
                const attributes: string[] = dataToSave.elements.reduce((attrs, {elements: elements}) => {
                    for (const elem of elements) {
                        if (elem.type === FormElementTypes.field && typeof elem.settings.attribute !== 'undefined') {
                            attrs.push(elem.settings.attribute);
                        }
                    }

                    return attrs;
                }, []);

                // Check if they exist
                const existingAttributes = await attributeDomain.getAttributes({
                    params: {withCount: false},
                    ctx
                });
                const invalidAttributes = difference(
                    attributes,
                    existingAttributes.list.map(a => a.id)
                );

                if (invalidAttributes.length) {
                    throw new ValidationError({
                        elements: {
                            msg: Errors.UNKNOWN_FORM_ATTRIBUTES,
                            vars: {attributes: invalidAttributes.join(', ')}
                        }
                    });
                }
            }

            return existingForm
                ? formRepo.updateForm({formData: dataToSave, ctx})
                : formRepo.createForm({formData: dataToSave, ctx});
        },
        async deleteForm({library, id, ctx}): Promise<IForm> {
            // Check permissions
            const permToCheck = LibraryPermissionsActions.ADMIN_LIBRARY;
            if (
                !(await libraryPermissionDomain.getLibraryPermission({
                    action: permToCheck,
                    libraryId: library,
                    userId: ctx.userId,
                    ctx
                }))
            ) {
                throw new PermissionError(permToCheck);
            }

            const filters: IFormFilterOptions = {library, id};
            // Check if form exists
            const forms = await formRepo.getForms({
                params: {
                    filters,
                    strictFilters: true,
                    withCount: false
                },
                ctx
            });

            if (!forms.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_FORM});
            }

            return formRepo.deleteForm({formData: forms.list[0], ctx});
        }
    };
}
