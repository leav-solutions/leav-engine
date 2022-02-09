// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IFormRepo} from 'infra/form/formRepo';
import {difference} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {FormElementTypes, IForm, IFormFilterOptions, IFormStrict} from '../../_types/forms';
import {IList, SortOrder} from '../../_types/list';
import {LibraryPermissionsActions} from '../../_types/permissions';
import {validateLibrary} from './helpers/validateLibrary';

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
    getFormProperties({library, id, ctx}: {library: string; id: string; ctx: IQueryInfos}): Promise<IForm>;
    saveForm({form, ctx}: {form: IForm; ctx: IQueryInfos}): Promise<IForm>;
    deleteForm({library, id, ctx}: {library: string; id: string; ctx: IQueryInfos}): Promise<IForm>;
}

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.library'?: ILibraryPermissionDomain;
    'core.infra.form'?: IFormRepo;
    'core.utils'?: IUtils;
}

export default function (deps: IDeps = {}): IFormDomain {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.domain.permission.library': libraryPermissionDomain = null,
        'core.infra.form': formRepo = null,
        'core.utils': utils = null
    } = deps;

    return {
        async getFormsByLib({library, params, ctx}): Promise<IList<IForm>> {
            const filters = {...params?.filters, library};
            const initializedParams = {...params, filters};

            await validateLibrary(library, deps, ctx);

            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return formRepo.getForms({params: initializedParams, ctx});
        },
        async getFormProperties({library, id, ctx}): Promise<IForm> {
            const filters = {id, library};

            await validateLibrary(library, deps, ctx);

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

            await validateLibrary(dataToSave.library, deps, ctx);

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
